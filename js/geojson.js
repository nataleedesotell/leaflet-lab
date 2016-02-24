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
    maxZoom: 6,
    //my unique id and accessToken
    id:'nataleedesotell.p8942221',
    accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
}).addTo(map);
    //call getData function
    getData(map);
};

//add a point to layer with parameters feature & lat long
function pointToLayer(feature, latlng) {
    //attribute we're using for the point's value
    var attribute = "NORM2003";
    //customize what the point looks like
    var options = {
        fillColor: "#FFA824",
        color: false,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //set up variable for the attribute value, set equal to a number (cannot be a string)
    var attValue = Number(feature.properties[attribute]);
    //set the radius equal to our equation for the radius proportion based on the attribute value
    options.radius = calcPropRadius(attValue);
    //set up variable layer = to a leaflet circlemarker
    var layer = L.circleMarker(latlng, options);
    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>State:</b> " + feature.properties.STATES+ "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    //content that will be in the popups
    popupContent += "<p><b>Road Accident Injuries in " + 2003 + ":</b> " + Math.round(feature.properties[attribute]) + " per 100,000 people</p>";
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

    layer.on({
        //open a popup when the mouse is over the circle
        mouseover: function() {
            this.openPopup();
        },
        //close the popup when the mouse is off the popup
        mouseout: function(){
            this.closePopup();
        },
        click: function() {
            //show popup when circle is clicked
            $("#panel").html(popupContent)
        }
    });
    //pushes this layer to the map
    return layer;

};
//create a function for the slider with parameter map
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //attibutes for the slider to customize steps, value, etc.
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1

    });
    //add a reverse button
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    ///add a skip button
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

};

//set up a new function for processing data (where we'll loop thru NORM attributes)
function processData(data) {
    //set up empty array called attributes
    var attributes = [];
    //set up variable properties 
    var properties = data.features[0];
    //any attribute in properties in the geojson file
    for (var attribute in properties) {
        //when "NORM" is found (>-1)
        if (attribute.indexOf("NORM")>-1) {
            //push that into our array (i.e., creates an array of NORM2003, NORM2004, etc.)
            attributes.push(attribute);
        };
    };
    //print to the console
    console.log(attributes);
    //push these values to the map
    return attributes;
};
//set up function to calculate our proportions
function calcPropRadius(attValue) {
    //variable scaleFactor is a constant, 50
    var scaleFactor = 50;
    // variable area equals our attribute value * 50
    var area = attValue*scaleFactor;
    //calculate radius of proportional symbol based on area
    var radius = Math.sqrt (area/Math.PI);
    //push that value to the map
    return radius;
};
//set up function to create our proportional symbols
function createPropSymbols(data, map) {
    //create marker options
    L.geoJson (data, {
        //all the code for this can be found in pointToLayer function so it points there
        pointToLayer: pointToLayer
        //add them to the map
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
            //set up variable attributes and points to processData function
            var attributes = processData(response);
            //points to createPropSymbols
            createPropSymbols (response, map, attributes);
            //points to createSequenceControls function to create slider
            createSequenceControls(map, attributes);
            }
        })
    };

$(document).ready(createMap);

