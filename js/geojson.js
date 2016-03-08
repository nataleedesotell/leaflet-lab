//issues still needing to be addressed:
//1: forward/reverse buttons won't work in the legend?
//2. there is no minimum value for 2011?



//5th interaction operator is at the bottom of this page commented out 

//function to instantiate Leaflet map
function createMap(){
    //create the map with a particular center and zoom
    var map = L.map('map', {
        center: [22.5, 70],
        zoom: 5
        //layers: [propsymbol, choropleth]
    });

    //attempt at bounding map to south Asia
    //L.latLngBounds( <LatLng> 5, 60, <LatLng> 31,97);


    //add OSM base tilelayer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //describes layer data
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    //the max level of zoom allowed
    maxZoom: 6,

    //my unique id and accessTokens
    id:'nataleedesotell.pbicm6p9',
    accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
}).addTo(map);
    //call getData function
    getData(map);
}

function createPopup(properties, attribute, layer, radius) {
    var popupContent
}

//add a point to layer with parameters feature & lat long
function pointToLayer(feature, latlng, attributes) {
    //onsole.log("made it to pointtolayer"); //success
    //attribute we're using for the point's value
    var attribute = attributes[0];
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
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function(map) {

            var container = L.DomUtil.create('div', 'sequence-control-container');
            $(container).append('<div id="temporal-legend">')
            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $('#reverse').append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $('#forward').append('<button class="skip" id="forward" title="Forward">Skip</button>');
            $('#reverse').html('<img src="img/back.png">');
            $('#forward').html('<img src="img/forward.png">');
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            return container;
        }
    });

    map.addControl(new SequenceControl());

    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    
    //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
    
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
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
};

//set up empty array attributes
var attributes = [];
//set up a new function for processing data (where we'll loop thru NORM attributes)
function processData(data){
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


    return attributes;
}

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
}


function createLegend(map, attributes) {
    var LegendControl = L.Control.extend ({
        options: {
            position: 'bottomright'
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'legend-control-container');

            var svg = '<svg id="attribute-legend" width="160px" height="180px">';
            var circles = {
            max: 130,
            mean: 150,
            min: 170
        };

        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#FFA900" fill-opacity="0.7" stroke="#000000" cx="60"/>';
            //text string
            svg += '<text id="' + circle + '-text" x="120" y="' + circles[circle] + '"></text>';
        };
        //close svg string
        svg += "</svg>";
        //add attribute legend svg to container
        $(container).append(svg);   
        return container;
        }
    });
    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
}
//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;
    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
    //set mean
    var mean = (max + min) / 2;
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("M")[1];
    var content = "<h3><b>" + "Injuries in " + year + "</b></h3>" + "<br>";
        //replace legend content
        //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
    $('#temporal-legend').html(content);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 170 - radius,
            r: radius
        });
        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "");
      };
};


//set up function to create our proportional symbols
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
    updatePropSymbols(map, attributes[0]);
    
}


function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer)
    {
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
            popupContent += "<p><b>Injuries in " + year + ":</b> " + Math.round(props[attribute]) + " per 100,000 people</p>";
            updateLegend(map, attribute);
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
              });
           } //end of if statement
   });
}


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

            updatePropSymbols(map, attributes);
            createLegend(map, attributes);
            }
        });
    }




// //PSEUDO-CODE FOR ATTRIBUTE LEGEND
// 1. Add an `<svg>` element to the legend container
// 2. Add a `<circle>` element for each of three attribute values: max, mean, and min
// 3. Assign each `<circle>` element a center and radius based on the dataset max, mean, and min values of the current attribute
// 4. Create legend text to label each circle
// 5. Update circle attributes and legend text when the data attribute is changed by the user


















// ///FIFTH INTERACTION OPERATOR///

// //function to instantiate Leaflet map
// function createMap(){
//     //create the map with a particular center and zoom
//     var map = L.map('map', {
//         center: [22.5, 80],
//         zoom: 5
//     });
//     //add OSM base tilelayer
//     L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//     //describes layer data
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//     //the max level of zoom allowed
//     maxZoom: 6,
//     //my unique id and accessToken
//     id:'nataleedesotell.p8942221',
//     accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
// }).addTo(map);
//     //call getData function
//     getChoroData(map);
// }


// // control that shows state info on hover
// var info = L.control();

// info.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'info');
//     this.update();
//     return this._div;
// };

// info.update = function (props) {
//     this._div.innerHTML = '<h4>India Traffic Injuries</h4>' +  (props ?
//         '<b>' + props.name + '</b><br />' + props.NORM2003 + ' people / mi<sup>2</sup>'
//         : 'Hover over a state');
// };
// //using NORM2003 as a baseline, will edit to be more interactive later hopefuly?

// info.addTo(map);


// // get color depending on injury value
// function getColor(d) {
//     return d > 200  ? '#E31A1C' :
//            d > 100  ? '#FC4E2A' :
//            d > 50   ? '#FD8D3C' :
//            d > 20   ? '#FEB24C' :
//            d > 10   ? '#FED976' :
//                       '#FFEDA0';
// }

// //style for the choropleth
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

// //using NORM2003 for now, edit later

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
//     map.fitBounds(e.target.getBounds());
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight,
//         click: zoomToFeature
//     });
// }

// geojson = L.geoJson(IndiaRoadAccidentsChoro, {
//     style: style,
//     onEachFeature: onEachFeature
// }).addTo(map);

// map.attributionControl.addAttribution('Injury data &copy; <a href="data.in.gov">India Government Data</a>');


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