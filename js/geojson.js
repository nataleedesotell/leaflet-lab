//issues still needing to be addressed:
//1: forward/reverse buttons won't work in the legend?
//2. finish 5th operator! 
//3. max bounds?
//4. Bottom circle in legend different color


function createMap(){
    var prop = L.tileLayer ('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', 
      //  map.fitBounds([
        //    [6, 60],
          //  [36, 97]
       // ]),
        {id: 'nataleedesotell.pbicm6p9', 
        accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA', 
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'}),

        chor   = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {id: 'nataleedesotell.pbicm6p9', accessToken:'pk.eyJ1IjoibmF0YWxlZWRlc290ZWxsIiwiYSI6ImNpa29uMGNxNTB4d3Z0aWo3bWdubHJ4bGMifQ.1kpv2xbqsnS0sJ9ew0bJIA', attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'});


    //create the map with a particular center and zoom
    var map = L.map('map', {
        center: [20, 78],
        zoom: 5,
        layers: [prop, chor]
    });

    var maptypes = {
        "Proportional Symbol Map": prop,
        "Choropleth Map": chor
    };

    L.control.layers(maptypes).addTo(map);

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
            //$('#reverse').html('<img src="img/back.png">');
            //$('#forward').html('<img src="img/forward.png">');
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
            position: 'topright'
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
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#FFA900" fill-opacity="0.7" stroke="grey" cx="60"/>';
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
        max:  max,
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



$(document).ready(createMap);