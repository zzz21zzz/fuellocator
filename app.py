from cs50 import SQL
from flask import Flask, render_template, request, jsonify, redirect
import requests

app = Flask(__name__)

# Google Maps API Key
GOOGLE_API_KEY = 'AIzaSyDLAxYcPgfuoXDo6srqMLgxD7w4FCzQwJE'

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///stations.db")


@app.route('/')
def index():
    # Render the home page and pass the Google Maps API key
    return render_template('home.html', api_key=GOOGLE_API_KEY)


@app.route('/nearby-stations', methods=['GET'])
def nearby_stations():
    # Fetch the latitude and longitude from the request
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    # Call Google Places API to get nearby gas stations
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'location': f'{lat},{lng}',  # User's location
        'radius': 2000,             # Search radius in meters
        'type': 'gas_station',      # Filter for gas stations
        'key': GOOGLE_API_KEY       # API key
    }
    response = requests.get(url, params=params)
    data = response.json()

    # Fetch average time spent for each station from the database
    for station in data.get("results", []):
        name = station["name"]
        result = db.execute(
            "SELECT AVG(time_spent_minutes) as avg_time FROM stations WHERE name = ?", name)
        station["avg_time"] = result[0]["avg_time"]

    return jsonify(data)  # Return the data as JSON


@app.route('/report', methods=['GET', 'POST'])
def report():
    if request.method == "GET":
        # GET: Fetch nearby stations for reporting
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'location': f'{lat},{lng}',
            'radius': 2000,
            'type': 'gas_station',
            'key': GOOGLE_API_KEY
        }
        response = requests.get(url, params=params)
        data = response.json()

        # Extract station details for dropdown
        stations = [
            {"name": station["name"], "address": station.get("vicinity", "N/A")}
            for station in data.get("results", [])
        ]

        return render_template('report.html', stations=stations)
    else:
        # POST: Insert reported time into the database
        station_name = request.form.get("station")
        station_address = request.form.get("station_address")
        time_spent = request.form.get("time_spent")
        print(station_name, station_address, time_spent)

        if not station_name or not station_address or not time_spent:
            # Validate inputs
            return "Invalid form submission. All fields are required."

        db.execute("INSERT INTO stations (name, address, time_spent_minutes) VALUES(?, ?, ?)",
                   station_name, station_address, time_spent)

        return redirect('/')


@app.route('/history', methods=['GET'])
def history():
    # Fetch all reports from the database
    rows = db.execute("SELECT name, address, time_spent_minutes FROM stations")
    print(rows)
    return render_template('history.html', rows=rows)


@app.route('/ranked-stations', methods=['GET'])
def ranked_stations():
    lat = request.args.get('lat')
    lng = request.args.get('lng')

    # Call Google Places API to fetch nearby stations
    url_places = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params_places = {
        'location': f'{lat},{lng}',
        'radius': 2000,
        'type': 'gas_station',
        'key': GOOGLE_API_KEY
    }
    response_places = requests.get(url_places, params=params_places)
    places_data = response_places.json()

    stations = []
    seen_stations = set()  # Avoid duplicate entries
    for station in places_data.get("results", []):
        name = station["name"]
        address = station.get("vicinity", "N/A")

        if (name, address) in seen_stations:
            continue  # Skip duplicates
        seen_stations.add((name, address))

        # Fetch average time and report count from the database
        result = db.execute("""
            SELECT
                AVG(time_spent_minutes) as avg_time,
                COUNT(time_spent_minutes) as report_count
            FROM stations
            WHERE name = ? AND address = ?
        """, name, address)
        avg_time = result[0]["avg_time"] if result else None
        report_count = result[0]["report_count"] if result else 0
        search_link = f"https://www.google.com/maps/search/?api=1&query={name.replace(' ', '+')},+{address.replace(' ', '+')}"

        if not avg_time or avg_time <= 0:
            continue  # Skip stations with no data

        # Append station details
        stations.append({
            "name": name,
            "address": address,
            "avg_time": avg_time,
            "report_count": report_count,
            "search_link": search_link
        })

    # Sort stations by average time and return top 3
    stations = sorted(stations, key=lambda x: x["avg_time"])
    return jsonify(stations[:3])

# Copyright Isa and Femi
