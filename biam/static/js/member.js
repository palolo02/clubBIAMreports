
loadMembers();

// Stack bars colors
//var colors = ['#722431','#317224','#243172']
var colors = ['#004468','#008190','#00AF8E']
var chooseColor = 0;
var member;
var year;

function loadMembers(){
    var url = `/api/v1/getActiveMembers/2020`;
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        
        // Get keys and values from dataframe
        keys = d3.keys(schema)        
        values = d3.values(schema)
        // Get only values from result        
        values = values.map(d => d3.values(d))
        //console.log(values[1])
        values[1].forEach(function(v){
            //console.log(v);
            d3.select("#selMember").append("option").attr('value',v).text(v)
        });
        //Initialize components
        init();
    });
}

// Function to initialize graphs on webpage
function init(){
    option = d3.select("#selMember").property("value");
    member = option
    year = 2020
    option = option.replace(" ","%20")
    url_detailed_data = `/api/v1/getDetailedResults/${option}/2020`;
    url_role_data = `/api/v1/getRoleResults/${option}/2020`
    url_data = `/api/v1/getAllResults/${option}/2020`
    
    renderDetailedData(url_detailed_data);
    renderYearlyData(url_data);
    renderRoleData(url_role_data);

    loadMemberEvent()

}

// Function to attach a listener event when the dropdown selection changes
function loadMemberEvent(){

    d3.select("#selMember").on("change",function(){
        option = d3.select("#selMember").property("value");
        member = option
        year = 2020
        option = option.replace(" ","%20");
        url_detailed_data = `/api/v1/getDetailedResults/${option}/2020`;
        renderDetailedData(url_detailed_data);
        url_role_data = `/api/v1/getRoleResults/${option}/2020`
        renderRoleData(url_role_data);
        url_data = `/api/v1/getAllResults/${option}/2020`
        renderYearlyData(url_data); 
    });
}

// Function to render the table for monthly participations
// parameters: URL => API call with parameters to retrieve data from JSON
function renderDetailedData(url){

    // Read data from Flask
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
        // Remove all content from table
        tableData.selectAll("*").remove()
        d3.select(".header").selectAll("*").remove()

        // Add headers in HTML table
        header = tableData.append("tr")
        Object.entries(obj[0]).forEach(([key, value]) => {
            // Replace month numbers per names
            if(key.includes("."))
                header.append("th").text(`${getMonthName(parseInt(key))}`)
            else
                header.append("th").text(`${key}`)
        });
    
        // Add rows in HTML table
        obj.forEach(function(row){
            trow = tableData.append("tr");
            Object.entries(row).forEach(([key, value]) => {
                if(value == null || value == 0)
                    trow.append("td").text('')
                else if (key == 'Rol' || key == 'TipoRol')
                    trow.append("td").text(`${value}`).classed('name',true)
                else if (key == 'Total')
                    trow.append("td").classed('total',true).text(`${value}`)
                else{
                    classHeatMap = getHeatMapClassMember(value)
                    trow.append("td").classed(classHeatMap,true).text(`${value}`)
                }   
            });
            
        });
        
    
});

}

// Function to render the montly participations per Role in session
// parameters: URL => API call with parameters to retrieve data from JSON
function renderRoleData(url){

    // Read stats from Flask
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        //console.log(schema)       
        // Get keys and values from dataframe
        keys = d3.keys(schema)
        values = d3.values(schema)
        // Get only values from result
        
        values = values.map(d => d3.values(d))

        obj = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            obj.push(temp)
        }

        noParticipaciones = obj.map(r => r['NoParticipaciones'])
        
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
          
        var layoutRole = {
            //barmode: 'bar',
            //title:'Participaciones por Tipo de Rol',
            xaxis:{
                visible:false
            },
            yaxis:{
                showgrid: false,
                //showline: false,
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
          
        Plotly.newPlot('role', dataRole, layoutRole, {displayModeBar: false}, {responsive: true});
    }); 

}

// Function to render the montly participations for the entire year
// parameters: URL => API call with parameters to retrieve data from JSON
function renderYearlyData(url){

    // Read stats from Flask
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        //console.log(schema)
        //console.log(schema)       
        // Get keys and values from dataframe
        keys = d3.keys(schema)
        values = d3.values(schema)
        // Get only values from result
        values = values.map(d => d3.values(d))

        var results = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            results.push(temp)
        }

        var traceLineTable = {
            x: getMonths(results.map(r => r['Mes'])),
            y: results.map(r => r['NoParticipaciones']),
            // Enable data values on graph
            text: results.map(r => r['NoParticipaciones']),
            //textposition: 'top',
            //mode: 'lines+markers+text',
            mode: 'lines',
            name: '',
            type: 'scatter',
            hovertemplate: '<b>Participaciones</b>: %{y:}' +
                        '<br><b>Mes</b>: %{x}<br>'
            /*hovertemplate: '<i>Participaciones</i>: $%{y:.2f}' +
            '<br><b>Mes</b>: %{x}<br>' +
            '<b>%{text}</b>'
            */
        };
        
        var dataPoints = [traceLineTable];

        var layoutTable = {
            //title:'Asistencias en el año',
            hovermode: true,
            
            //hoverinfo: 'skip',
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
          
        Plotly.newPlot('yearly', dataPoints, layoutTable, {displayModeBar: false}, {responsive: true});
        
    }); 

}

