//function to instantiate Leaflet map
function createMap(){
    //create the map with a particular center and zoom
    var map = L.map('map', {
        center: [21, 82],
        zoom: 5
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

function pointToLayer(feature, latlng) {
    var attribute = "NORM2003";
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, options);
    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>State:</b> " + feature.properties.STATES+ "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Road Accident Injuries in " + 2003 + ":</b> " + Math.round(feature.properties[attribute]) + " per 100,000 people</p>";
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

    layer.on({
        mouseover: function() {
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });
    return layer;

};

function calcPropRadius(attValue) {
    var scaleFactor = 20;
    var area = attValue*scaleFactor;
    var radius = Math.sqrt (area/Math.PI);
    return radius;
};

function createPropSymbols(data, map) {
    //create marker options

    L.geoJson (data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    
    $.ajax("data/IndiaRoadAccidents.geojson", {
        //specify that we expect to get a json file back
        dataType: "json",
        //in the case of a success, run this function:
        success: function(response){
            createPropSymbols (response, map);
            }
        })
    };

$(document).ready(createMap);

