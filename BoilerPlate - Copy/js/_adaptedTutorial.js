/* Example from Leaflet Quick Start Guide*/

var map = L.map('map').setView([39.74, -104.99], 3);

//add tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);  var marker = L.marker([539.74, -104.99]).addTo(map);

//************************************************ */

//************************************************ */
 //load the data
 fetch("data/MegaCities.geojson")
 .then(function(response){
     return response.json();
 })
 .then(function(json){
     //create a Leaflet GeoJSON layer and add it to the map
     L.geoJson(json).addTo(map);
 })


//add to map
L.geoJSON(geojsonFeature).addTo(map);

//create marker options
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//create a Leaflet GeoJSON layer and add it to the map
L.geoJson(json, {
    pointToLayer: function (feature, latlng){
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

//Example 2.3 load the data    
L.then(function(json){            
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(json, {
        pointToLayer: function (feature, latlng){
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
});


//empty layer
//var myLayer = L.geoJSON().addTo(map);
//myLayer.addData(geojsonFeature);

/*pointtolayer create circle marker
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
*/

/*
//onEachFeature attach popup to feature
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

*/

/*
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
*/