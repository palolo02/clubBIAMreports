
init();

   function init(){
    url_detailed_data = '/api/v1/getDetailedResults/Javier%20Salazar/2020';
    url_role_data = '/api/v1/getRoleResults/Javier%20Salazar/2020'
    url_data = '/api/v1/getAllResults/Javier%20Salazar/2020'
    renderDetailedData(url_detailed_data);
    renderYearlyData(url_data);
    renderRoleData(url_role_data);
}


function renderDetailedData(url){

    // Read data from Flask
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
        console.log(obj)
        obj['Mes'] = getMonths(obj.map(o => o['Mes']))

        // Add table data in HTML
        data = d3.select(".data");
        
        header = data.append("tr")
        header.append("th").text('Mes')
        header.append("th").text('Rol')
        header.append("th").text('Tipo Rol')
        header.append("th").text('Participaciones')

        obj.forEach(function(row){
            trow = data.append("tr");
            trow.append("td").text(`${getMonthName(row['Mes'])}`)
            trow.append("td").text(`${row['Rol']}`)
            trow.append("td").text(`${row['TipoRol']}`)
            trow.append("td").classed("table-success",true).text(`${row['Participaciones']}`)
        });
        
    
});

}

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
        
        var data = [];
        
        roles.forEach(function(role){
            rows = obj.filter(row => row['TipoRol'] == role);
            data.push({
                x: getMonths(rows.map(r => r['Mes'])),
                y: rows.map(r => r['NoParticipaciones']),
                text: rows.map(r => r['NoParticipaciones']),
                textposition: 'auto',
                name: role,
                type: 'bar'
              });
        })
        
        //
          
        var layout = {
            barmode: 'stack',
            title:'Por Tipo de Rol',
            xaxis:{title:"Mes"},
            yaxis:{title:"Participaciones",range: [0, 10]}
        };
          
        Plotly.newPlot('role', data, layout, {displayModeBar: false}, {responsive: true});
    }); 

}


function renderYearlyData(url){

    // Read stats from Flask
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData)
        console.log(schema)
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

        var traceLine = {
            x: getMonths(results.map(r => r['Mes'])),
            y: results.map(r => r['NoParticipaciones']),
            text: results.map(r => r['NoParticipaciones']),
            textposition: 'top',
            mode: 'lines+markers+text',
            name: 'Participaciones',
            type: 'scatter'
        };
        
        var dataPoints = [traceLine];

        var layout = {
            title:'Participaciones en el año',
            xaxis:{title:"Mes"},
            yaxis:{title:"Participaciones", range: [0, 10]}
        };
          
        Plotly.newPlot('yearly', dataPoints, layout, {displayModeBar: false}, {responsive: true});
        
    }); 

}

