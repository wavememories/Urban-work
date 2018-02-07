queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

function makeGraphs(error, recordsJson) {
    //test logging json to console
    console.log(recordsJson);

    //Clean our input data
    var records = recordsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");

    records.forEach(function(d) {
        d["starttime"] = dateFormat.parse(d["starttime"])
        d["starttime"].setMinutes(0);
        d["starttime"].setSeconds(0);
        d["stoptime"] = dateFormat.parse(d["stoptime"]);
        d["stoptime"].setSeconds(0);
        d["stoptime"].setMinutes(0);
        d["start station longitude"] = +d["start station longitude"];
        d["start station latitude"] = +d["start station latitude"];
    });
    

    //Create a crossfilter instance

    var ndx = crossfilter(records);

    //Define data dimensions

    var startdtDim = ndx.dimension(function(d) { return d["starttime"]; });
    var startnhDim = ndx.dimension(function(d) { return d["starting neighborhood"]; });
    var enddtDim = ndx.dimension(function(d) { return d["endtime"]; });
    var endnhDim = ndx.dimension(function(d) { return d["end neighborhood"]; });
    var allDim = ndx.dimension(function(d) { return d;});

    //Define data groups

    var numRecordsByStartDate = startdtDim.group();
    var numRecordsByEndDate = enddtDim.group();
    var startNhGroup = startnhDim.group();
    var endNhGroup = endnhDim.group();
    var all = ndx.groupAll()

    // Define first and last timestamps
    var minStartDate = startdtDim.bottom(1)[0]["starttime"];
    var maxStartDate = startdtDim.top(1)[0]["starttime"];

    //test min-max dates
    console.log(minStartDate + maxStartDate);

    //Define DC charts
    var timeChart = dc.barChart("#time-chart");
    var startNhChart = dc.rowChart("#startnh-row-chart");

    // For each DC chart, pass the necessary params

    timeChart
        .width(650)
        .height(140)
        .margins({top: 10, right: 10, bottom: 20, left: 20})
        .dimension(startdtDim)
        .group(numRecordsByStartDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minStartDate, maxStartDate]))
        .xUnits(d3.time.weeks)
        .elasticY(true)
        .yAxis().ticks(4);

    startNhChart
        .width(200)
        .height(510)
        .dimension(startnhDim)
        .group(startNhGroup)
        .ordering(function(d) {return -d.value})
        .colors(['#6bdaed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

    // Initialize a leaflet map
    var map = L.map('map');

        var drawMap = function(){
        
            map.setView([40.73221853, -73.98165557], 13);

            mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
            L.tileLayer(
                'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; ' + mapLink + ' Contributors',
                    maxZoom:30,
                }).addTo(map);
            

            //L.marker([40.73221853, -73.98165557]).addTo(map);
        
            //Heatmap
            var geoData = [];
            _.each(allDim.top(Infinity), function (d) {
                geoData.push([d["start station latitude"], d["start station longitude"], 1]);
            });
            var heat = L.heatLayer(geoData,{
                radius:10,
                blur: 20,
                maxZoom: 1,
            }).addTo(map);

            //var marker = L.marker([40.73221853, -73.98165557]).addTo(map);
            var marker = L.marker([40.75323098,-73.97032517]).addTo(map);
            //L.marker(geoData).addTo(map);

            if (error) throw error;
            console.log("error!");
        
    };

    // call drawMap to display Map

    drawMap();

    // define rules for updating map. Any time we filter DC charts, we redraw map

    dcCharts = [timeChart, startNhChart];

    _.each(dcCharts, function (dcChart) {
        dcChart.on("filtered", function(chart, filter) {
            map.eachLayer(function (layer) {
                map.removeLayer(layer)
            });
        drawMap();
        });
    });

    // finally, call dc renderall function to render all charts

    dc.renderAll();

};
