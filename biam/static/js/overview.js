console.log('Loading data for year');


init();

function init(){
    url_data = '/api/v1/getStatsPerClub/2020';
    renderTableClub(url_data);
    url_data_session_type = '/api/v1/getStatsPerSessionType/2020';
    renderTableSessionType(url_data_session_type);
    
}


function renderTableClub(url){

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
        header = d3.select("#table_results table .header");
        trow = header.append("tr");
        // Iterate over each header

        for (i=1; i < keys.length;i++){
            trow.append("th").text(keys[i])
        }
    
        // Add table data in HTML
        data = d3.select("#table_results table .data");
        //For row in results add all the column
        for (i=0; i< values[0].length;i++){
            trow = data.append("tr");

            for(j=1; j<values.length;j++){
                // for percentage
                
                if(i==0)
                    trow.append("td").classed("table-secondary",true).text(`${values[j][i]}`)
                else
                    trow.append("td").text(values[j][i])
                /*
                    else if(j>0 && j%2 ==0 && values[j][i] >= 30 && values[j][i] <= 60)
                    trow.append("td").classed("table-warning",true).text(`${values[j][i]}%`)
                else if(j>0 && j%2 ==0 && values[j][i] !== null && values[j][i] < 30)
                    trow.append("td").classed("table-danger",true).text(`${values[j][i]}%`)
                
                else if(j == values.length-1 && values[j][i] >= 10)
                    trow.append("td").classed("table-success",true).text(`${values[j][i]}`)
                else if(j == values.length-1 && values[j][i] >= 5 && values[j][i] < 10)
                    trow.append("td").classed("table-warning",true).text(`${values[j][i]}`)
                else if(j == values.length-1 && values[j][i] < 5)
                    trow.append("td").classed("table-danger",true).text(`${values[j][i]}`)
                else
                */
                
                
            }
        }
        
    
});

}


function renderTableSessionType(url){

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
        header = d3.select("#table_session_type table .header");
        trow = header.append("tr");
        // Iterate over each header

        for (i=1; i < keys.length;i++){
            trow.append("th").text(keys[i])
        }
    
        // Add table data in HTML
        data = d3.select("#table_session_type table .data");
        //For row in results add all the column
        for (i=0; i< values[0].length;i++){
            trow = data.append("tr");

            for(j=1; j<values.length;j++){
                // for percentage
                
                if(i==0)
                    trow.append("td").classed("table-secondary",true).text(`${values[j][i]}`)
                else
                    trow.append("td").text(values[j][i])
                /*
                    else if(j>0 && j%2 ==0 && values[j][i] >= 30 && values[j][i] <= 60)
                    trow.append("td").classed("table-warning",true).text(`${values[j][i]}%`)
                else if(j>0 && j%2 ==0 && values[j][i] !== null && values[j][i] < 30)
                    trow.append("td").classed("table-danger",true).text(`${values[j][i]}%`)
                
                else if(j == values.length-1 && values[j][i] >= 10)
                    trow.append("td").classed("table-success",true).text(`${values[j][i]}`)
                else if(j == values.length-1 && values[j][i] >= 5 && values[j][i] < 10)
                    trow.append("td").classed("table-warning",true).text(`${values[j][i]}`)
                else if(j == values.length-1 && values[j][i] < 5)
                    trow.append("td").classed("table-danger",true).text(`${values[j][i]}`)
                else
                */
                
                
            }
        }
        
    
});

}
