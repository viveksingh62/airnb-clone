mapboxgl.accessToken = window.mapToken;

console.log("Coordinates:", window.coordinates);

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: window.coordinates, // <-- use the actual coords here too
  zoom: 12
});

// Add marker
new mapboxgl.Marker({ color: 'Red' })
  .setLngLat(window.coordinates)
  .setPopup(new mapboxgl.Popup().setHTML(` <p>Exact Location provided after booking<p>`))
  .addTo(map);
