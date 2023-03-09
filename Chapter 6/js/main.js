//declare map var in global scope
var map;
var dataStats = {};
var minValue;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [40.81, -96.7],
        zoom: 5
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);

};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var school of data.features){
        //loop through each year
        for(var year = 1996; year <= 2020; year+=4){
              //get population for current year
              var value = school.properties[String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});

    dataStats.mean = sum/ allValues.length;

}    
/*
function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var school of data.features){
        //loop through each year
        for(var year = 1996; year <= 2020; year+=4){
              //get population for current year
              var value = school.properties[String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}
*/
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.2 * Math.pow(attValue/dataStats.min,0.75) * minRadius

    return radius;
};

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute/*.split("_")[1]*/;
    this.enrollment = this.properties[attribute];
    this.formatted = "<p><b>School:</b> " + this.properties.School + "<p><b>Enrollment in " + this.year + ":</b> " + this.enrollment + " undergrads</p>" ;
 
};

    
//Step 3: Add circle markers for point features to the map
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //check
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#b2ff00",
        color: "#000",
        weight: .8,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = new PopupContent(feature.properties, attribute)
    //create another popup based on the first
   // var popupContent2 = Object.create(popupContent);

    //change the formatting of popup 2
    //popupContent2.formatted = "<h2>" + popupContent.enrollment + " undergrads</h2>";

   // console.log(popupContent.formatted) //original popup content

    //change the formatting
    //popupContent.formatted = "<h2>" + popupContent.enrollment + " undergrads</h2>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0,-options.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


//update temporal legend
//document.querySelector("span.year").innerHTML = year;

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        console.log("here!");
        document.querySelector("span.year").innerHTML = attribute;
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = new PopupContent(props, attribute);

            //update popup with new content
            var popup = layer.getPopup();
            popup.setContent(popupContent.formatted).update();
        };
    });
};

//Above Example 3.10...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};

//Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

             //create range input element (slider)
             container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/L.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/R.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
            
            return container;
        }
    });

    map.addControl(new SequenceControl());    // add listeners after adding control}

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //Step 5: click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;

            //Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })

    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //Step 6: get the new index value
        var index = this.value;

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};


function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
            container.innerHTML = '<p class="temporalLegend">Enrollment in <span class="year">1996</span></p>';
            
            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="80px">';

             //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){  

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 50 - radius;  

                //circle string  
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#b2ff00" fill-opacity="0.8" stroke="#000000" cx="35"/>';  
        
                //evenly space out labels            
                var textY = i * 15 + 20;            

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100/100)  + '</text>';
             };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);
            return container;
            
        }
    });
    map.addControl(new LegendControl());
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/big_ten_enroll.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create an attributes array
            var attributes = processData(json);
            calcStats(json);
            //calculate minimum data value
            //minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
            
        })

}; 
    
document.addEventListener('DOMContentLoaded',createMap)
//git