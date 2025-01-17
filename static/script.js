let map, userMarker; // Global variables to store the map object and user location marker

// Function to fetch ranked stations based on the user's location
function fetchRankedStations(location) {
    fetch(`/ranked-stations?lat=${location.lat}&lng=${location.lng}`) // Sends a GET request to fetch ranked stations
        .then((response) => response.json()) // Parse the JSON response
        .then((stations) => {
            const rankedStations = document.getElementById("ranked-stations"); // Get the container for ranked stations
            rankedStations.innerHTML = `<h3>Your Top 3 Stations</h3>`; // Add a heading to the ranked stations list
            if (stations.length === 0) { // If no stations are returned
                rankedStations.innerHTML += `<p>No data available for nearby stations.</p>`; // Display a message
                return;
            }
            // Iterate over the stations and display their details
            stations.forEach((station, index) => {
                rankedStations.innerHTML += `
                    <div class="station">
                        <h4>#${index + 1}: ${station.name}</h4> <!-- Station rank and name -->
                        <p>Address: ${station.address}</p> <!-- Station address -->
                        <p>Avg Time: ${station.avg_time.toFixed(2)} mins</p> <!-- Average time spent -->
                        <p>Reports: ${station.report_count}</p> <!-- Number of reports for the station -->
                        <p><a href="${station.search_link}" target="_blank">View on Google Maps</a></p> <!-- Link to Google Maps -->
                    </div>
                    <hr>
                `;
            });
        })
        .catch((error) => console.error("Error fetching ranked stations:", error)); // Log any errors
}

// Function to initialize the map
function initMap() {
    // Default location set to Lagos, Nigeria
    const defaultLocation = {
        lat: 6.5244,
        lng: 3.3792
    };
    const reportLink = document.getElementById("report-link"); // Get the report link element

    // Create the map object with default settings
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });

    // Check if the browser supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Update the report link with user's current location
                reportLink.href = `/report?lat=${userLocation.lat}&lng=${userLocation.lng}`;
            },
            () => {
                // Handle errors when geolocation fails or is denied
                console.error("Unable to fetch user location.");
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser."); // Log error if geolocation isn't supported
    }

    // Additional geolocation and nearby stations logic
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Update report link with user location
                reportLink.href = `/report?lat=${userLocation.lat}&lng=${userLocation.lng}`;

                // Place a marker for the user on the map
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                });

                map.setCenter(userLocation); // Center the map on the user's location
                fetchNearbyStations(userLocation); // Fetch nearby stations
            }
        );
    } else {
        alert("Geolocation is not supported by your browser."); // Alert user if geolocation fails
        fetchNearbyStations(defaultLocation); // Use the default location as a fallback
    }

    // Fetch ranked stations after getting user's location
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            fetchRankedStations(userLocation); // Fetch ranked stations for the user's location
        },
        () => {
            console.error("Unable to fetch user location."); // Log error if geolocation fails
        }
    );
}

// Function to fetch nearby stations from the backend
function fetchNearbyStations(location) {
    const url = `/nearby-stations?lat=${location.lat}&lng=${location.lng}`; // URL with user's location

    fetch(url)
        .then((response) => response.json()) // Parse the JSON response
        .then((data) => {
            const stations = data.results; // Extract station data from the response
            stations.forEach((station) => {
                const marker = new google.maps.Marker({
                    position: station.geometry.location, // Place marker at the station's location
                    map: map,
                    title: station.name, // Set the marker title to the station's name
                });

                // Add click listener to the marker to show station details
                marker.addListener("click", () => {
                    document.getElementById("details").innerHTML = `
                        <strong>${station.name}</strong><br>
                        Address: ${station.vicinity}<br>
                        Average Time: ${station.avg_time ? station.avg_time.toFixed(2) : 'No data'} minutes
                    `;
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching stations:", error); // Log any errors during fetch
        });
}


function handlePopup() {
    const popup = document.getElementById("popup");
    const closePopup = document.getElementById("close-popup");

    // Check sessionStorage to decide whether to show the popup
    if (!sessionStorage.getItem("popupClosed")) {
        popup.style.display = "flex"; // Show the popup
    }

    // Add event listener to close the popup
    closePopup.addEventListener("click", () => {
        popup.style.display = "none"; // Hide the popup
        sessionStorage.setItem("popupClosed", "true"); // Set flag in sessionStorage
    });
}

// Execute both popup and map initialization on page load
window.onload = function() {
    handlePopup(); // Initialize popup
    initMap(); // Initialize map
};
