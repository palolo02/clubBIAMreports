/*
Author: Paolo Vega
Last Update: Feb 10, 2021
Change: Add comments to functions 
Version: 1.0.5
*/


// Retrieve currently active members
loadMembers();

// General options for graphs
var colors = ['#004468','#008190','#00AF8E']
var chooseColor = 0;
var member;
var year;

/*
Function: loadMembers
Objective: Get all the active members in a specific year
Parameters: None
Remarks: Currently, we need to specify the year to load members (2021)
*/
function loadMembers(){
    var url = `/api/v1/getActiveMembers/2021`;
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        // Get keys and values from dataframe
        keys = d3.keys(schema)        
        values = d3.values(schema)
        // Get only values from result        
        values = values.map(d => d3.values(d))
        values[1].forEach(function(v){
            d3.select("#selMember").append("option").attr('value',v).text(v)
        });
        //Initialize components
        init();
    });
}

/*
Function: init
Objective: Call all the API requests to render the graphs in the page
Parameters: None
*/
function init(){
    // Get current memeber selection
    option = d3.select("#selMember").property("value");
    // To display member selection in graphs
    member = option
    // Get current year selection
    year = d3.select("#selYear").property("value");
    option = option.replace(" ","%20")
    // Define API requests
    url_detailed_data = `/api/v1/getDetailedResults/${option}/${year}`;
    url_role_data = `/api/v1/getRoleResults/${option}/${year}`
    url_data = `/api/v1/getAllResults/${option}/${year}`
    // Call and render their content
    renderDetailedData(url_detailed_data);
    renderYearlyData(url_data);
    renderRoleData(url_role_data);
    // Adds a filter selection listener when the user changes his selection
    loadMemberEvent()

}

/*
Function: loadMemberEvent
Objective: Detect user selection filters on webpage
Parameters: None
*/
function loadMemberEvent(){
    // Event listener in member selection
    d3.select("#selMember").on("change",function(){
        option = d3.select("#selMember").property("value");
        // To display member selection in graphs
        member = option
        year = d3.select("#selYear").property("value");
        option = option.replace(" ","%20");
        // Set parameters in API requests
        url_detailed_data = `/api/v1/getDetailedResults/${option}/${year}`;
        renderDetailedData(url_detailed_data);
        url_role_data = `/api/v1/getRoleResults/${option}/${year}`
        renderRoleData(url_role_data);
        url_data = `/api/v1/getAllResults/${option}/${year}`
        renderYearlyData(url_data); 
    });
    // Event listener in year selection
    d3.select("#selYear").on("change",function(){
        option = d3.select("#selMember").property("value");
        // To display year selection in graphs
        member = option
        year = d3.select("#selYear").property("value");
        // Set parameters in API requests
        option = option.replace(" ","%20");
        url_detailed_data = `/api/v1/getDetailedResults/${option}/${year}`;
        renderDetailedData(url_detailed_data);
        url_role_data = `/api/v1/getRoleResults/${option}/${year}`
        renderRoleData(url_role_data);
        url_data = `/api/v1/getAllResults/${option}/${year}`
        renderYearlyData(url_data); 
    });

}

/*
Function: renderDetailedData
Objective: Renders the heat map of yearly member participations in the club
Parameters: API URL
*/
function renderDetailedData(url){

    // Read data from request
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        // Get keys and values from dataframe
        keys = d3.keys(schema)        
        values = d3.values(schema)
        // Get only values from result        
        values = values.map(d => d3.values(d))
        // Create an iterable object with all properties from JSON
        obj = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            obj.push(temp)
        }

        // Get table element to render data
        var tableData = d3.select(".data");
        d3.select("#table_results table").classed("table-biam", true)
        // Remove all content from table (if any)
        tableData.selectAll("*").remove()
        d3.select(".header").selectAll("*").remove()

        // Add headers in HTML table
        header = tableData.append("tr")
        Object.entries(obj[0]).forEach(([key, value]) => {
            // Replace month numbers with names
            if(key.includes("."))
                header.append("th").text(`${getMonthName(parseInt(key))}`)
            else
                header.append("th").text(`${key}`)
        });
    
        // Add rows in HTML table
        obj.forEach(function(row){
            trow = tableData.append("tr");
            // For each row, evaluate if it's going to show any text or number to add a formatting class
            Object.entries(row).forEach(([key, value]) => {
                //Empty content
                if(value == null || value == 0)
                    trow.append("td").text('')
                // Text
                else if (key == 'Rol' || key == 'TipoRol')
                    trow.append("td").text(`${value}`).classed('name',true)
                // Gray total
                else if (key == 'Total')
                    trow.append("td").classed('total',true).text(`${value}`)
                // Number with color gradient
                else{
                    classHeatMap = getHeatMapClassMember(value)
                    trow.append("td").classed(classHeatMap,true).text(`${value}`)
                }   
            });
            
        });
        
    
});

}

/*
Function: renderRoleData
Objective: Renders total yearly member participations per role as a bar chart
Parameters: API URL
*/
function renderRoleData(url){

    // Read stats from request
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        // Get keys and values from dataframe
        keys = d3.keys(schema)
        values = d3.values(schema)
        // Get only values from result
        values = values.map(d => d3.values(d))
        // Create an iterable object with all properties from JSON
        obj = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            obj.push(temp)
        }
        //Get number of participations
        noParticipaciones = obj.map(r => r['NoParticipaciones'])
        // Create bar chart with percentages and labels
        var dataRole = [
            {
                x: obj.map(r => r['Perc']),
                y: obj.map(r => r['TipoRol']),
                text: obj.map(r => { return r['Perc'] + ' %'}),
                z: obj.map(r => { return r['NoParticipaciones'] + ' %'}),
                textposition: 'auto',
                type: 'bar',
                orientation:"h",
                name: '',
                marker: {
                    color: colors[0],
                    line: {
                      color: colors[0]
                    }
                }
                /*
                hovertemplate: '<b>% Participaciones</b>: %{x:}' +
                        '<br><b>No Participaciones</b>:%{y}<br>'
                */
              }
        ]
        // Define data layout for formatting details
        var layoutRole = {
            xaxis:{
                visible:false
            },
            yaxis:{
                showgrid: false,
                automargin: true,
                tickfont: {
                    family: 'Old Standard TT, serif',
                    size: 14,
                    color: 'gray'
                }
                
            },
            hovermode: false,
            hoverinfo: 'skip',
            annotations: [
                {
                  xref: 'paper',
                  yref: 'paper',
                  x: -0.3,
                  y: 1.3,
                  xanchor: 'left',
                  yanchor: 'top',
                  text: `Participaciones por Rol en ${year}`,
                  font:{
                    family: 'Arial',
                    size: 30,
                    color: 'rgb(37,37,37)'
                  },
                  showarrow: false
                },
                {
                  xref: 'paper',
                  yref: 'paper',
                  x: 0.0,
                  y: 1.13,
                  xanchor: 'left',
                  yanchor: 'top',
                  text: `% de participaciones en todo el año`,
                  showarrow: false,
                  font: {
                    family: 'Arial',
                    size: 12,
                    color: 'rgb(150,150,150)'
                  }
                }
            ],
            margin:{
                pad:0
            }            
        };
        // Create final graph with data and formatting layout
        Plotly.newPlot('role', dataRole, layoutRole, {displayModeBar: false}, {responsive: true});
    }); 

}

/*
Function: renderYearlyData
Objective: Renders total yearly participations as a line chart
Parameters: API URL
*/
function renderYearlyData(url){

    // Read stats from Flask
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        // Get keys and values from dataframe
        keys = d3.keys(schema)
        values = d3.values(schema)
        // Get only values from result
        values = values.map(d => d3.values(d))
        // Create an iterable object with all properties from JSON
        var results = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            results.push(temp)
        }
        // Define data for line graph
        var traceLineTable = {
            x: getMonths(results.map(r => r['Mes'])),
            y: results.map(r => r['NoParticipaciones']),
            // Enable data values on graph
            text: results.map(r => r['NoParticipaciones']),
            mode: 'lines',
            name: '',
            type: 'scatter',
            hovertemplate: '<b>Participaciones</b>: %{y:}' +
                        '<br><b>Mes</b>: %{x}<br>'
        };
        
        var dataPoints = [traceLineTable];
        // Define layout for line chart
        var layoutTable = {
            hovermode: true,
            xaxis:{
                title:"", 
                showgrid: false,
                tickfont: {
                    family: 'Old Standard TT, serif',
                    size: 12,
                    color: 'gray'
                }
            },
            yaxis:{
                autotick: true,
                linecolor: 'lightgray',
                side:'left',
                range: [0, 10],
                showgrid: false,
                tickfont: {
                    family: 'Old Standard TT, serif',
                    size: 10,
                    color: 'gray'
                }
            },
            annotations: [
                {
                  xref: 'paper',
                  yref: 'paper',
                  x: -0.2,
                  y: 1.3,
                  xanchor: 'left',
                  yanchor: 'top',
                  text: `Asistencias en ${year}`,
                  font:{
                    family: 'Arial',
                    size: 30,
                    color: 'rgb(37,37,37)'
                  },
                  showarrow: false
                },
                {
                  xref: 'paper',
                  yref: 'paper',
                  x: -0.1,
                  y: 1.13,
                  xanchor: 'left',
                  yanchor: 'top',
                  text: `Asistencias`,
                  showarrow: false,
                  font: {
                    family: 'Arial',
                    size: 12,
                    color: 'rgb(150,150,150)'
                  }
                }
            ]
        };
        // Create line chart with data and formatting details
        Plotly.newPlot('yearly', dataPoints, layoutTable, {displayModeBar: false}, {responsive: true});
        
    }); 

}

