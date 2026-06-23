const handleFetchData = () => {
  const routeDataDiv = document.getElementById("route-data");
  routeDataDiv.innerText = "Fetching...";

  fetch("/api/v1/route")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Server error");
      }
      return response.json();
    })
    .then((data) => {
      routeDataDiv.innerText = "Data fetched";
      initMap(data);
    })
    .catch((error) => {
      routeDataDiv.innerText = "Error fetching route data";
      console.error("Error:", error);
    });
};

const initMap = (data) => {
  if (typeof L === "undefined") {
    console.log("Leaflet is not initialized yet");
    return;
  }
  const lat = 47.69008467960837;
  const lon = 19.13739702507176;
  const zoom = 16;
  const map = L.map("map").setView([lat, lon], zoom);
  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  const ways = [];
  // Iterate through the stops and add marker for each
  data.data[0].forEach((stop) => {
    if (!stop.visible) return;
    L.marker([stop.lat, stop.lon], {
      clickable: true,
      draggable: false,
    }).addTo(map);

    // Collect all stop location for line drawing
    ways.push(L.latLng(stop.lat, stop.lon));
  });

  // Draw line with the location list
  L.Routing.control({
    router: L.Routing.osrmv1({
      serviceUrl: "https://osrm.hqnet.hu:8083/route/v1",
    }),
    waypoints: ways,
    routeWhileDragging: false,
    createMarker: function (i, wp, nWps) {
      return false;
    },
    lineOptions: {
      addWaypoints: false,
      styles: [{ color: "blue", opacity: 1, weight: 3 }],
    },
  }).addTo(map);
};

// Initialize listeners
document
  .getElementById("fetch-route")
  .addEventListener("click", handleFetchData);
