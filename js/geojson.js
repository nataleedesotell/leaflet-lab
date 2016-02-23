//function to instantiate Leaflet map
function createMap(){
    //create the map with a particular center and zoom
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    //add OSM base tilelayer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //describes layer data
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    //the max level of zoom allowed
    maxZoom: 18,
    //my unique id and accessToken
    id:'nataleedesotell.p5njl1g8',
    accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
}).addTo(map);


    //call getData function
    getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    
    $.ajax("data/IndiaRoadAccidents.geojson", {
        //specify that we expect to get a json file back
        dataType: "json",
        //in the case of a success, run this function:
        success: function(response){
            //specify the specs of the circle symbols for each city
            var geojsonMarkerOptions = {
                //specifies the radius for the marker
                radius: 6,
                //specifies a coral fill color for the marker
                fillColor: "#FF7F50",
                //color for the marker
                color: "#000",
                //weight of the marker
                weight: 2,
                //opacity of the marker
                opacity: 2,
                //opacity of the fill
                fillOpacity: 0.7
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                //passes pointToLayer function while creating layer
                pointToLayer: function (feature, latlng){
                    //should return a circlemarker
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
                //add this to the map
            }).addTo(map);
            

            //create a Leaflet GeoJSON layer and add it to the map
        }
    });
};



$(document).ready(createMap);

