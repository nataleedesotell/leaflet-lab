//fifth interaction operator


// Import GeoJSON data--done (in getData()) and call getData function
function statesData(map){
    //load the data
    $.ajax("data/IndiaRoadAccidentsChoro.geojson", {
        dataType: "json",
        success: function(response){

          var a = L.geoJson(response, {style: style});

           var overlayMaps = {
             "Background Checks": a,
           };

          L.control.layers(null, overlayMaps).addTo(map);

        }
    });
};

function getColor(d) {
    return d > 1500000 ? '#084594' :
           d > 1000000  ? '#2171b5' :
           d > 500000  ? '#4292c6' :
           d > 100000  ? '#6baed6' :
           d > 500000   ? '#9ecae1' :
           d > 10000   ? '#c6dbef' :
           d > 1000   ? '#deebf7' :
                      '#f7fbff';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.Checks),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9
    };
}

$(document).ready(statesData);