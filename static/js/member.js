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
        //console.log(keys)
        //console.log(values)
        
        // Add table headers in HTML
        header = d3.select(".header");
        trow = header.append("tr");
        // Iterate over each header
        keys.forEach(function(h){
            if(h != 'Socio' && h != 'Año')
                trow.append("th").text(h)
        })
    
        // Add table data in HTML
        data = d3.select(".data");
        //For row in results add all the column
        for (i=2; i< values[0].length;i++){
            trow = data.append("tr");

            for(j=2; j<values.length;j++){
                // for percentage
                
                if(j>0 && j%2 == 0 && values[j][i] > 60)
                    trow.append("td").classed("table-success",true).text(`${values[j][i]}`)
                else if(j>0 && j%2 ==0 && values[j][i] >= 30 && values[j][i] <= 60)
                    trow.append("td").classed("table-warning",true).text(`${values[j][i]}`)
                else if(j>0 && j%2 ==0 && values[j][i] !== null && values[j][i] < 30)
                    trow.append("td").classed("table-danger",true).text(`${values[j][i]}`)
                
                else if(j == values.length-1 && values[j][i] >= 10)
                    trow.append("td").classed("table-success",true).text(`${values[j][i]}`)
                else if(j == values.length-1 && values[j][i] >= 5 && values[j][i] < 10)
                    trow.append("td").classed("table-warning",true).text(`${values[j][i]}`)
                else if(j == values.length-1 && values[j][i] < 5)
                    trow.append("td").classed("table-danger",true).text(`${values[j][i]}`)
                else
                    trow.append("td").text(values[j][i])
                
                
            }
        }
        
    
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
                x: rows.map(r => r['Mes']),
                y: rows.map(r => r['NoParticipaciones']),
                text: rows.map(r => r['NoParticipaciones']),
                textposition: 'auto',
                name: role,
                type: 'bar'
              });
        })
          
          
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
            x: results.map(r => r['Mes']),
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

