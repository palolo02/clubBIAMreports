/*
Author: Paolo Vega
Last Update: Feb 10, 2021
Change: Add comments to functions 
Version: 1.0.5
*/


var availableMonths = {}


init();

/*
Function: init
Objective: Set all initial API requests to render data
Parameters: None
Remarks: Currently, we need to specify the available years (2020,2021) and available months
*/
function init(){
    
    availableYears = [2021,2020];

    availableMonths = 
    [
    /*
    {'year':2021,'month':'2021,05','text':'May 2021'},
    */
    {'year':2021,'month':'2021,04','text':'Abr 2021'},
    {'year':2021,'month':'2021,03','text':'Mar 2021'},    
    {'year':2021,'month':'2021,02','text':'Feb 2021'},
    {'year':2021,'month':'2021,01','text':'Ene 2021'},
    /*{'year':2020,'month':'2020,01','text':'Ene 2020'},
    {'year':2020,'month':'2020,02','text':'Feb 2020'},
    {'year':2020,'month':'2020,03','text':'Mar 2020'},
    */
    {'year':2020,'month':'2020,04','text':'Abr 2020'},
    {'year':2020,'month':'2020,05','text':'May 2020'},
    {'year':2020,'month':'2020,06','text':'Jun 2020'},
    {'year':2020,'month':'2020,07','text':'Jul 2020'},
    //{'year':2020,'month':'2020,08','text':'Ago 2020'},
    {'year':2020,'month':'2020,09','text':'Sep 2020'},
    {'year':2020,'month':'2020,10','text':'Oct 2020'},
    {'year':2020,'month':'2020,11','text':'Nov 2020'},
    {'year':2020,'month':'2020,12','text':'Dic 2020'}
    ]

    // Add options for the Year selector
    sel = d3.select("#selYear");
    availableYears.forEach(function(o){
        opt = sel.append("option")
        opt.attr('value',o).text(o);
    });
    
    // Add options for the Month selector
    sel = d3.select("#selMonth");
    availableMonths.forEach(function(o){
        opt = sel.append("option")
        opt.attr('value',o['month']).text(o['text']);
    });
    // Define API requests
    option = d3.select("#selMonth").property("value");
    parameters = option.split(',');
    url_data = `/api/v1/getResultsPerDateRange/${parameters[0]}/${parameters[1]}`;
    rendertable(url_data);
    url_stats = `/api/v1/getStatsPerDateRange/${parameters[0]}/${parameters[1]}`
    renderStats(url_stats);
    // Adds a filter selection listener when the user changes his selection
    loadEvents();
}

/*
Function: loadEvents
Objective: Define API requests according to selected filters (month and year)
Parameters: None
*/
function loadEvents(){
    
    // Detects any change in the year selector to filter months accordingly
    d3.select("#selYear").on("change",function(){
        // Get current year selected
        year = d3.select("#selYear").property("value");
        // Load options for the Month selector
        sel = d3.select("#selMonth");
        // Remove and add available months for selected year
        sel.selectAll("option").remove();
        availableMonths.filter(y => y["year"] == year).forEach(element => {
            opt = sel.append("option")
            opt.attr('value',element['month']).text(element['text']);
        });
        // With selected filters, define API requests and render results for the first available month
        option = d3.select("#selMonth").property("value");
        parameters = option.split(',');
        var url = `/api/v1/getResultsPerDateRange/${parameters[0]}/${parameters[1]}`
        d3.selectAll("tr").remove();
        rendertable(url);
        var url_stats = `/api/v1/getStatsPerDateRange/${parameters[0]}/${parameters[1]}`
        renderStats(url_stats);    
        
    });

    // Detects any change in the month selector
    d3.select("#selMonth").on("change",function(){
        option = d3.select("#selMonth").property("value");
        parameters = option.split(',');
        var url = `/api/v1/getResultsPerDateRange/${parameters[0]}/${parameters[1]}`
        d3.selectAll("tr").remove();
        rendertable(url);
        var url_stats = `/api/v1/getStatsPerDateRange/${parameters[0]}/${parameters[1]}`
        renderStats(url_stats);
    });
}

/*
Function: rendertable
Objective: Render data in the table for monthly analysis
Parameters: API URL
*/
function rendertable(url){
    
    // Read data from request
    d3.json(url).then((incomingData) =>{

        //Parse JSON result
        schema = JSON.parse(incomingData)
        // Get keys and values from dataframe
        keys = d3.keys(schema)
        values = d3.values(schema)
        // Get only values from result
        values = values.map(d => d3.values(d))
        obj = []
        // Create an iterable object with all properties from JSON
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            obj.push(temp)
        }
        // Geth name from monts
        obj['Mes'] = getMonths(obj.map(o => o['Mes']))
        // Obtain the Max value from the totals to calculate percetages to show
        maxTotal = Math.max.apply(Math, obj.map(o => o['Total']))
        // Add table data in HTML
        data = d3.select(".data");
        d3.select("#table_results table").classed("table-biam", true)
        header = data.append("tr")
        keys.forEach(function(h){
            header.append("th").classed('title',true).text(h);
        })
        
        // Add table data in HTML
        data = d3.select(".data");
        obj.forEach(function(row){
            trow = data.append("tr");
            Object.entries(row).forEach(([key, value]) => {
                // Evaluate if the value is empty
                if(value == null )
                    trow.append("td").text('')
                // Evaluate if it's a gray total
                else if(key == 'Total')
                    trow.append("td").classed('total',true).text(`${value}`)
                // Evaluate if it's the percetage of participations
                else if(key != 'Socios')
                {
                    classHeatMap = getHeatMapClassMember(value)
                    trow.append("td").classed(classHeatMap,true).text(`${value}`)
                }
                // Evaluate if it's the name of the member
                else
                    trow.append("td").classed('name',true).text(`${value}`)
            });
        });
    });

}

/*
Function: renderStats
Objective: Render No of members and No of sessions in a month at the top pf the webpage
Parameters: API URL
*/
function renderStats(url){

    // Read stats from request
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData);
        keys = d3.keys(schema);
        values = d3.values(schema);
        // Get only values from result
        values = values.map(d => d3.values(d));
        // Add data to KPIS for members and number of sessions
        members = d3.select(".kpi_memb").text(values[2]);
        sessions = d3.select(".kpi_sess").text(values[3]);
    }); 

}

