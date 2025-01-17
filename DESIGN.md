
### **DESIGN.md**

```markdown
# Design Document: Fuel Locator

Fuel Locator is designed to provide real-time decision support for users in choosing fuel stations. Below is a detailed explanation of the technical implementation.

---

## Overview
Fuel Locator uses Flask as the backend framework and Google Maps APIs for map rendering and geolocation. The core functionalities include:
1. Fetching nearby stations using the Google Places API.
2. Displaying ranked stations based on user-reported wait times.
3. Enabling users to log their wait times via a reporting form.

---

## Backend

### Flask Application
- **`app.py`**: This file serves as the main application file and handles routing and business logic. Key routes include:
  - `/`: Renders the homepage with the map.
  - `/nearby-stations`: Fetches nearby stations using the Google Places API and enriches the data with average wait times from the SQLite database.
  - `/ranked-stations`: Fetches top 3 ranked stations
  - `/report`: Handles both GET (fetch station list to populate form) and POST (log wait times into database) requests.
  - `/history`: Displays a table of user-reported wait times.

### Database
- **SQLite**:
  - The `stations` table stores station names, addresses, and reported wait times.
  - Queries aggregate data to calculate average wait times and report counts.

### Google Maps APIs
1. **JavaScript API**:
   - Renders the interactive map and places user and station markers.

---

## Frontend

### HTML Templates
- **`index.html`**:
  - Base template with Bootstrap integration for layout and styling.
- **`home.html`**:
  - Displays the map, ranked stations, and popup explaining the project’s purpose.
- **`report.html`**:
  - Form for users to log their wait times.
- **`history.html`**:
  - Table of user-reported data.

### CSS
- Custom styles in `style.css` handle visual elements such as the popup, map container, and station details. Also implemented Bootstrap.

### JavaScript
- **`script.js`**:
  - Initializes the map, handles geolocation, fetches station data, and displays ranked stations.
  - Includes logic for showing and dismissing a popup.

---

## Key Design Decisions

### JavaScript in report page
- Only the name of the station gets sent through the form initially. The station tag only returns the name of the station and not the address. To fix this, we added a disabled option with id address to send the address separately
### Why SQLite?
- SQLite is lightweight and fits the project scope, as the dataset (user-reported times) is small and doesn’t require complex relationships.

### Why Google Maps APIs?
- The APIs are comprehensive and provide accurate geolocation and map rendering.

### User Experience Enhancements
- **Popup**: Introduces the context of the project to first-time users in a non-intrusive way.
- **Session Storage**: Used to track whether the user has dismissed the popup.

---

## Challenges and Solutions

### Challenge: Avoiding duplicate station data
- **Solution**: Use a `seen_stations` set in `/ranked-stations` to skip duplicates based on station name and address.

### Challenge: Handling missing geolocation
- **Solution**: Defaulted the map to Lagos, Nigeria, when geolocation is unavailable.

---

## Conclusion
Fuel Locator combines design with code to address a real-world problem. This project is scalable for future enhancements and adaptable for deployment in other regions.


This project, Fuel Locator,  is the intellectual property of Oluwafemi Ositade and Isa Salmanu, and thus  all applicable rights are reserved.

