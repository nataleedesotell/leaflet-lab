var attributes = [];

//function to instantiate Leaflet map
function createMap(){
    //create the map with a particular center and zoom
    var map = L.map('map', {
        center: [22.5, 80],
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
    getChoroData(map);
}

//add a point to layer with parameters feature & lat long
function pointToLayer(feature, latlng, attributes) {
    //console.log("made it to pointToLayer");
    //onsole.log("made it to pointtolayer"); //success
    //attribute we're using for the point's value
    var attribute = attributes[0];
    //check
    //console.log(attribute);
    //customize what the point looks like
    var options = {
        fillColor: "#FFA900",
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
    var popupContent;

    //content that will be in the popups
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
            $("#panel").html(popupContent);
        }
    });
    //pushes this layer to the map
    return layer;

}
//Step 1: Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    
    //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
    
    //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    
    //Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/back.png">');
    $('#forward').html('<img src="img/forward.png">');
    
   //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //increment or decriment depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        };

        //update slider
        $('.range-slider').val(index);

        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('change', function(){
        //get the new index value
        var index = $(this).val();

        //console.log(index);
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
};


//set up a new function for processing data (where we'll loop thru NORM attributes)
function processData(data){
    //console.log("made it to processdata"); //success
    //empty array to hold attributes


    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        
        //only take attributes with population values
        if (attribute.indexOf("NORM") > -1){
            attributes.push(attribute);
        }
    }

    //check result
    //console.log(attributes);

    return attributes;
}

//set up function to calculate our proportions
function calcPropRadius(attValue) {
    //console.log("made it to calcPropRadius") //success
    //variable scaleFactor is a constant, 50
    var scaleFactor = 50;
    // variable area equals our attribute value * 50
    var area = attValue*scaleFactor;
    //calculate radius of proportional symbol based on area
    var radius = Math.sqrt (area/Math.PI);
    //push that value to the map
    return radius;
}
//set up function to create our proportional symbols
function createPropSymbols(data, map, attributes){
    //console.log("made it to createPropSymbols"); //success
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
    updatePropSymbols(map, attributes[0]);
}


function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
                 //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>State:</b> " + props.STATES + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("M")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + Math.round(props[attribute]) + " per 100,000 people</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
              });
           } //end of if statement
   });
}


//function to retrieve the data and place it on the map
function getData(map){
    //console.log("made it to getData"); //success
    //load the data
    
    $.ajax("data/IndiaRoadAccidents.geojson", {
        //specify that we expect to get a json file back
        dataType: "json",
        //in the case of a success, run this function:
        success: function(response){
            //console.log("made it to function response");
            //set up variable attributes and points to processData function
            var attributes = processData(response);
            //points to createPropSymbols
            createPropSymbols (response, map, attributes);
            //points to createSequenceControls function to create slider
            createSequenceControls(map, attributes);

            updatePropSymbols(map, attributes);
            }
        });
    }

///FIFTH INTERACTION OPERATOR///


// var map = L.map('map').setView([22.5, 80], 5);

//     L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     //describes layer data
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//     //the max level of zoom allowed
//     maxZoom: 6,
//     //my unique id and accessToken
//     id:'nataleedesotell.p8942221',
//     accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
// }).addTo(map);


// // control that shows state info on hover
// var info = L.control();

// info.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'info');
//     this.update();
//     return this._div;
// };

// info.update = function (props) {
//     this._div.innerHTML = '<h4>India Road Accident Injuries</h4>' +  (props ?
//         '<b>' + props.name + '</b><br />' + props.NORM2003 + ' injuries / mi<sup>2</sup>'
//         : 'Hover over a state');
// };

// info.addTo(map);


// // get color depending on population density value
// function getColor(d) {
//     return d > 200  ? '#E31A1C' :
//            d > 100  ? '#FC4E2A' :
//            d > 50   ? '#FD8D3C' :
//            d > 20   ? '#FEB24C' :
//            d > 10   ? '#FED976' :
//                       '#FFEDA0';
// }

// function style(feature) {
//     return {
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.7,
//         fillColor: getColor(feature.properties.NORM2003)
//     };
// }

// function getChoroData(map){
//     console.log("made it to getchoroData"); //success
//     //load the data
    
//     $.ajax("data/IndiaRoadAccidentsChoro.geojson", {
//         //specify that we expect to get a json file back
//         dataType: "json",
//         //in the case of a success, run this function:
//         success: function(response){
//             console.log("made it to function response choro");

//             }
//         });
//     }

// function highlightFeature(e) {
//     var layer = e.target;

//     layer.setStyle({
//         weight: 5,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 0.7
//     });

//     if (!L.Browser.ie && !L.Browser.opera) {
//         layer.bringToFront();
//     }

//     info.update(layer.feature.properties);
// }

// var geojson;

// function resetHighlight(e) {
//     geojson.resetStyle(e.target);
//     info.update();
// }

// function zoomToFeature(e) {
//     console.log("made ot to zoomtofeat")
//     map.fitBounds(e.target.getBounds());
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight,
//         click: zoomToFeature
//     });
// }

// map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


// var legend = L.control({position: 'bottomleft'});

// legend.onAdd = function (map) {

//     var div = L.DomUtil.create('div', 'info legend'),
//         grades = [0, 10, 20, 50, 100, 200],
//         labels = [],
//         from, to;

//     for (var i = 0; i < grades.length; i++) {
//         from = grades[i];
//         to = grades[i + 1];

//         labels.push(
//             '<i style="background:' + getColor(from + 1) + '"></i> ' +
//             from + (to ? '&ndash;' + to : '+'));
//     }

//     div.innerHTML = labels.join('<br>');
//     return div;
// };

// legend.addTo(map);







$(document).ready(createMap);