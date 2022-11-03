mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: campGeo.geometry.coordinates, // starting position [lng, lat]
zoom: 4 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
.setLngLat(campGeo.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h4><b>${campGeo.title}</b></h4><p>${campGeo.location}</p>`
    )
)
.addTo(map)

