# Fuel Locator Documentation

## Overview
The aim of our web application is to help users save time when filling up their cars with fuel. We developed this app using the following technologies:
- **HTML**
- **CSS**
- **JavaScript**
- **Flask**
- **SQLite**

## How It Works
1. Run the application using Flask.
2. The home page will open, and a prompt will appear in your browser requesting access to your location data.
   - **Note:** Location data is essential for the Google Maps API functionality.
3. The home page displays an interactive map with markers for gas stations within a 2KM radius of your location.
   - Clicking on a marker will show a dropdown displaying:
     - The station name.
     - The address.
     - The average wait time (if available).
   - If no data is available for a station, "No data" will be displayed.

## Navigation
The top of the page contains links to the following:
- **Home Page:** Takes you back to the main interactive map.
- **Report Page:** Allows users to report how long they spent at a particular station.
  - Features:
    - A dropdown to select nearby gas stations.
    - An input bar that accepts only positive integers for reporting time.
- **History Page:** Displays all reports made by users.
  - Users can use this data to make informed decisions about which gas station to visit.

## Error Handling
- If a station name or the reported time is missing when submitting a report, an error message will be displayed.


## Video Demonstration
[Watch the YouTube video demonstration here.](https://youtu.be/pd6Ju17gWTc)


