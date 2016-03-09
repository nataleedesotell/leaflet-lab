//issues still needing to be addressed:
//2. max bounds?
//3. finish context/wording! 
//4. Text in legend needs to be placed correctly
//4. Random label chillin at the bottom
//5. Make sure to comment it all out and make it pretty! use jshint maybe


//function to instantiate map 
function createMap(){
    //set up a variable that holds the info for my proportional symbol map
    var prop = L.tileLayer ('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', 
        {id: 'nataleedesotell.pbicm6p9', 
        accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA', 
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'}),
    //set up a variable that holds info for my choropleth map for the reexpress 5th operator
        chor = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {id: 'nataleedesotell.pbicm6p9', accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA', attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'});
    //create the map with a particular center and zoom on India
    var map = L.map('map', {
        center: [20, 78],
        zoom: 5,
        //the map includes both layers
        layers: [prop, chor]
    });
    //variable that includes both map types and labels the radio buttons
    var maptypes = {
        "Choropleth Map": chor,
        "Proportional Symbol Map": prop
    };
    //$(document).ready(statesData);
    //add a control in the upper right with radio buttons for the 2 layers, not collapsed
    L.control.layers(maptypes, null,{collapsed:false}).addTo(map);
    //call getData function
    getData(map);
}
//add a point to layer with parameters feature & lat long
function pointToLayer(feature, latlng, attributes) {
    //attribute we're using for the point's value
    var attribute = attributes[0];
    //customize what the circles look like
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
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
            $('#reverse', container).html('<img src="img/back.png">');
            $('#forward', container).html('<img src="img/forward.png">');
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            return container;
        }
    });
    map.addControl(new SequenceControl());
    //create range input element (slider)
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
    var scaleFactor = 30;
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
            position: 'topright'
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'legend-control-container');
            var svg = '<svg id="attribute-legend" width="250px" height="100px">';
            var circles = {
            max: 130,
            mean: 150,
            min: 170
        };
        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#FFA900" fill-opacity="0.7" stroke="grey" cx="60"/>';
            //text string
            svg += '<text id="' + circle + '-text" x="160" y= ""  "' + circles[circle] + '"></text>';
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
    var mean =(max+min)/2;
    //return values as an object
    return {
        max:max,
        mean:mean,
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
            cy: 95 - radius,
            r: radius
        });  
        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]) + " injuries");
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
           }
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

//fifth interaction operator

// Import GeoJSON data--done (in getData()) and call getData function
// function statesData(map){
//     //load the data
//     $.ajax("data/IndiaRoadAccidentsChoro.geojson", {
//         dataType: "json",
//         success: function(response){
//           console.log(response);
//           var a = L.geoJson(response, {style: style});
//           L.control.layers(chor).addTo(map);

//         }
//     });
// };

// function getColor(d) {
//     return d > 200 ? '#084594' :
//            d > 150  ? '#2171b5' :
//            d > 100  ? '#4292c6' :
//            d > 75  ? '#6baed6' :
//            d > 50   ? '#9ecae1' :
//            d > 25   ? '#c6dbef' :
//            d > 1000   ? '#deebf7' :
//                       '#f7fbff';
// }

// function style(feature) {
//     return {
//         fillColor: getColor(feature.properties.NORM2003),
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.9
//     };
// }

$(document).ready(createMap);