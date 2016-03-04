//fifth interaction operator


// Import GeoJSON data--done (in getData()) and call getData function
function statesData(map){
    //load the data
    $.ajax("data/IndiaRoadAccidentsChoro.geojson", {
        dataType: "json",
        success: function(response){

          var a = L.geoJson(response, {style: style});

           var overlayMaps = {
             "Choropleth View": a,
           };

          L.control.layers(null, overlayMaps).addTo(map);

        }
    });
};

function getColor(d) {
    return 
           d > 200  ? '#4292c6' :
           d > 100  ? '#6baed6' :
           d > 50   ? '#9ecae1' :
           d > 10   ? '#c6dbef' :
           d > 1   ? '#deebf7' :
                      '#f7fbff';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.NORM2003),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9
    };
}

$(document).ready(createMap);