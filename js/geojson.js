//Fifth operator attempts have been taken out of the code for the sake of organization/cleanliness.


//function to instantiate the map
function createMap(){
    //create the map with a particular center and zoom
    var map = L.map('map', {
        center: [20.5, 79],
        zoom: 5,
        maxBounds: bounds
    });
    //add openstreetmap base tilelayer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    //the max level of zoom allowed
    //my unique id and accessToken
    id:'nataleedesotell.pbicm6p9',
    accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA'
}).addTo(map);
    //prevent users from zooming out into space or into the center of a prop symbol
      map.options.minZoom=5;
      map.options.maxZoom=7;
    //call getData function
    getData(map);
}
//set up variables to keep users from panning around like maniacs
var southWest = L.latLng(5, 60),
//you want to go look at Canada? Sorry bro this map is about India.
    northEast = L.latLng(33, 95),
    bounds = L.latLngBounds(southWest, northEast);

//function for creating layers for GeoJSON points
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
    //set up variable for the attribute value, set equal to a number
    var attValue = Number(feature.properties[attribute]);
    //set  radius equal to  equation for the radius proportion based on attribute value
    options.radius = calcPropRadius(attValue);
    //variable layer = to a leaflet circlemarker
    var layer = L.circleMarker(latlng, options);
    //set up variable for popupcontent
    var popupContent;
    //content that will be in the popups, styled in style.css
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
//Create new sequence controls
function createSequenceControls(map, attributes){
    //set up sequence control variable for a custom control
    var SequenceControl = L.Control.extend({
        //put this control in the topright
        options: {
            position: 'topright'
        },
        //contains code that creates DOM elements for the layer
        onAdd: function(map) {
            //create control container with a class name, style in style.css
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')
            //here's where he slider gets added
            $(container).append('<input class="range-slider" type="range">');
            //here's where the skip buttons are added
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
            //connects to files in img folder and adds in my custom pngs
            $('#reverse', container).html('<img src="img/back.png">');
            $('#forward', container).html('<img src="img/forward.png">');
            //stop double clicking from moving the map around while in this container
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            //at the end of it all, spit out a container with all the styling I gave it
            return container;
        }
    });
    //adds the slider to the map
    map.addControl(new SequenceControl());
    //set slider attributes to work for my specific data
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
   //click listener for buttons
    $('.skip').click(function(){
        //get old index value
        var index = $('.range-slider').val();
        //increment/decriment depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if the user clicks past the last attribute, wrap around to the first one
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        }
        //update slider
        $('.range-slider').val(index);
        //pass new attribute through to update symbols
        updatePropSymbols(map, attributes[index]);
    });
    //input listener for slider
    $('.range-slider').on('change', function(){
        //get the new index value
        var index = $(this).val();
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
}
//set up empty array attributes
var attributes = [];
//set up a new function for processing data (where we'll loop thru NORM attributes)
function processData(data){
    //empty array to hold attributes
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with a value that includes "NORM" (just injury stats)
        if (attribute.indexOf("NORM") > -1){
            attributes.push(attribute);
        }
    }
    return attributes;
}
//set up function to calculate our proportions
function calcPropRadius(attValue) {
    //scaleFactor is a constant, set so prop symbols are appropriate size
    var scaleFactor = 40;
    //  area equals = attribute value * scaleFactor
    var area = attValue*scaleFactor;
    //calculate radius of prop symbol based on area
    var radius = Math.sqrt (area/Math.PI);
    //push that value to the map
    return radius;
}
//set up a function to create our legend
function createLegend(map, attributes) {
    //set up custom control, put it in the top right along with the sequence control.
    var LegendControl = L.Control.extend ({
        options: {
            position: 'topright'
        },
        //contains code that creates DOM elements for the layer
        onAdd: function(map) {
            //create control container with a class name, style in style.css
            var container = L.DomUtil.create('div', 'legend-control-container');
            //svg for the legend 
            var svg = '<svg id="attribute-legend" width="300px" height="190px">';
            //set up nested circles so they look nice
            var circles = {
            max: 130,
            mean: 150,
            min: 170
        };
        //loop to add each circle and text to the svg string
        for (var circle in circles){
            //here is the circle string, including styling properties
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#FFA900" fill-opacity="0.7" stroke="#ffffff" cx="85"/>';
            //here is the text string with an x value but no y
            svg += '<text id="' + circle + '-text" x="140" y="' + circles[circle] + '"></text>';
        }
        //this closes the svg string
        svg += "</svg>";
        //add attribute legend svg to container
        $(container).append(svg);   
        return container;
        }
    });
//add the legend control to the map
    map.addControl(new LegendControl());
    //calls function to update the legend as the user clicks thru the years
    updateLegend(map, attributes[0]);
}
//Calculate the max, mean, and min values for a given attribute to create legend
function getCircleValues(map, attribute){
    //starting points
    var min = Infinity,
        max = -Infinity;
        //for each layer of the map
    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            //find the min
            if (attributeValue < min){
                min = attributeValue;
            }
            //find the max
            if (attributeValue > max){
                max = attributeValue;
            }
        }
    });
    //set the mean
    var mean =(max+min)/2;
    //return the values as an object
    return {
        max:max,
        mean:mean,
        min: min
    };
}
//set up function to update the legend dynamically
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("M")[1];
    //set up content variable equal to the title for the legend
    var content = "<h3><b>" + "Injuries in " + year + "</b></h3>" + "<br>";
        //add variable content to the temporal legend
    $('#temporal-legend').html(content);
    //set up a variable to grab the circle values from that function
    var circleValues = getCircleValues(map, attribute);
    //for the variable key in circleValues
    for (var key in circleValues){
        //find the radius
        var radius = calcPropRadius(circleValues[key]);
        //assign cy and r attributes to the circles
        $('#'+key).attr({
            cy: 170 - radius,
            r: radius
        });
        //add a unit to the end of the max/mean/min totals
        $('#'+key+'-text').text(Math.round(circleValues[key]) + " injuries");
      }
}
//set up function to create our proportional symbols
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            //push these to the map
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
    updatePropSymbols(map, attributes[0]);
}

//set up function that updates the symbols dynamically
function updatePropSymbols(map, attribute){
    //for each layer
    map.eachLayer(function(layer)
    {
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties, set it equal to a variable
            var props = layer.feature.properties;
            //update each feature's radius based on the new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //add the state name to popup content string
            var popupContent = "<p><b>State:</b> " + props.STATES + "</p>";
            //add formatted attribute to panel content string, only showing "2003" instead of "NORM2003"
            var year = attribute.split("M")[1];
            //add in the total, rounded to nearest integer for clarity
            popupContent += "<p><b>Injuries in " + year + ":</b> " + Math.round(props[attribute]) + " per 100,000 people</p>";
            //if we're updating symbols, we also need to update the legend. call that function too.
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
            //set up variable attributes and point to processData function
            var attributes = processData(response);
            //point to createPropSymbols function
            createPropSymbols (response, map, attributes);
            //points to createSequenceControls function to create slider
            createSequenceControls(map, attributes);
            //while we're at it, let's create the legend too
            createLegend(map, attributes);
            }
        });
    }
//createMap function will only run once the DOM is ready for JavaScript code to execute
$(document).ready(createMap);