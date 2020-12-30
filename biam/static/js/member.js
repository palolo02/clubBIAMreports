
loadMembers();

// Stack bars colors
//var colors = ['#722431','#317224','#243172']
var colors = ['#00274B','#008190','#00AF8E']
var chooseColor = 0;

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
        //console.log(obj)

       
        roles = [];
        maps = new Map();
        for (const item of obj.map(o => o['TipoRol'])) {
            if(!maps.has(item)){
                maps.set(item, true);    // set any value to Map
            roles.push(item);
            }
        }
        
        
        var dataRole = []
        roles.forEach(function(role){
            rows = obj.filter(row => row['TipoRol'] == role);
            dataRole.push({
                x: getMonths(rows.map(r => r['Mes'])),
                y: rows.map(r => r['NoParticipaciones']),
                text: rows.map(r => r['NoParticipaciones']),
                textposition: 'auto',
                name: role,
                type: 'bar',
                marker: {
                    color: colors[chooseColor],
                    line: {
                      color: colors[chooseColor]
                    }
                  }
              });
            chooseColor++;
        })
        chooseColor = 0;
        //
          
        var layoutRole = {
            barmode: 'stack',
            title:'Participaciones por Tipo de Rol',
            xaxis:{title:""},
            yaxis:{title:"Participaciones",range: [0, 10]},
            showlegend: true,
            hovermode: false,
            hoverinfo: 'skip',
            legend: {
                "orientation":"h"
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
            text: results.map(r => r['NoParticipaciones']),
            textposition: 'top',
            mode: 'lines+markers+text',
            name: 'Participaciones',
            type: 'scatter',
            marker: {
                color: '#00274B',
                line: {
                  color: '#00274B'
                }
              },
        };
        
        var dataPoints = [traceLineTable];

        var layoutTable = {
            title:'Asistencias en el año',
            hovermode: false,
            hoverinfo: 'skip',
            xaxis:{title:""},
            yaxis:{title:"Asistencias", range: [0, 10]}
        };
          
        Plotly.newPlot('yearly', dataPoints, layoutTable, {displayModeBar: false}, {responsive: true});
        
    }); 

}

