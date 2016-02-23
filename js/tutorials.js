//initialize map on the "map" div in index.html
//specify center and zoom
var map = L.map('map').setView([51.505, -0.09], 13);

//loads and displays tiles on the map
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //describes layer data
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    //the max level of zoom allowed
    maxZoom: 18,
    //my unique id and access token 
    id:'nataleedesotell.p5njl1g8',
    accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
}).addTo(map);

//adds a marker to the map at a particular gepgraphical point
var marker = L.marker([51.5, -0.09]).addTo(map);

//adds a circle to the map, specifying location, size, color, and opacity
var circle = L.circle([51.508, -0.11], 500, {
    //circle color red
    color: 'red',
    //fill color
    fillColor: '#f03',
    //fill opacity
    fillOpacity: 0.5
    //add it to the map
}).addTo(map);

//instantiates polygon based on array of points 
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);


//binds the popups to marker, circle, and polygon respectively
//marker popup opens
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//opens a popup object, optional to change appearance and location
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//instantiates a popup if the user clicks event object e
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

//load to the map
map.on('click', onMapClick);


// Start GeoJSON Leaflet Tutorial //

//sets up geojson variable
var geojsonFeature = {
    //specifies that the type is a feature
    "type": "Feature",
    //array of properies
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    //specifies the place/type of feature
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//adds the feature to our leaflet map
L.geoJson(geojsonFeature).addTo(map);
//sets up variable myLines
var myLines = [{
    //specifies type as a linestring
    "type": "LineString",
    //specifies coordinates in an array
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    //specifies type as a linestring
    "type": "LineString",
    //coordinates in an array
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//sets up variable myStyle to specify color, weight, and opacity
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//adds the style to leaflet map
L.geoJson(myLines, {
    style: myStyle
}).addTo(map);

//sets up variable states
var states = [{
    //specifies type of variable
    "type": "Feature",
    //properties listed in array
    "properties": {"party": "Republican"},
    //sets up location and type of feature
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    //sets up another type of the variable "states"
    "type": "Feature",
    //this type of state is party type Democrat
    "properties": {"party": "Democrat"},
    "geometry": {
        //these states are also polgyons with a different array of coordinates for location
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//add the states variable to our leaflet map
L.geoJson(states, {
    //the style to add to the feature
    style: function(feature) {
        switch (feature.properties.party) {
            //if republican, return color
            case 'Republican': return {color: "#ff0000"};
            //if democrat, return this other color
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
//finally add this all to the map
}).addTo(map)

//set up variable geojsonMarkerOptions to specify appearance of markers
var geojsonMarkerOptions = {
    //radius of marker
    radius: 8,
    //fill color of marker
    fillColor: "#ff7800",
    //stroke color of marker
    color: "#000",
    //weight of the marker
    weight: 1,
    //opacity of the marker (stroke, basically)
    opacity: 1,
    //opacity of  the fill
    fillOpacity: 0.8
};

//add a pointTolayer feature to the map
L.geoJson(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        //specifies that we want a circle marker in lat,long using the geojsonMarkerOptions appearance
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
    //add this to the map
}).addTo(map);

//set up function with parameters feature and layer
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) 
        //if true, attach popup with specified HTML content to marker so it appears when the object is clicked on
    {
        layer.bindPopup(feature.properties.popupContent);
    }
}

//set up variable for geojsonFeature
var geojsonFeature = {
    //type of variable is a feature
    "type": "Feature",
    //the feature has a name, amenity, and has a popup when clicked
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    //this is a point feature at these coordinates
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//add this function to the map so each feature with the popupContent property will have a popup when clicked
L.geoJson(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

//set up variable someFeatures
var someFeatures = [{
    //this is a feature
    "type": "Feature",
    //it has a name and a property called "show on map" set to true
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    //this is a point feature with specific coordinates
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    //this is another feature with a name, "show on map" set to false
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    //it is a point feature and has specific coordinates
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];
//add these features to the map
L.geoJson(someFeatures, {
    //but wait, if the feature has a property "show_on_map", use its true or false value to either show it or don't show it
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
    //add this to the map
}).addTo(map);