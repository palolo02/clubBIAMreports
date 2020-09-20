console.log('Loading data for year');


init();

function init(){
    url_data = '/api/v1/getStatsPerYear/2020';
    renderTableYear(url_data);
    
}


function renderTableYear(url){

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
            trow.append("th").text(h)
        })
    
        // Add table data in HTML
        data = d3.select(".data");
        //For row in results add all the column
        for (i=0; i< values[0].length;i++){
            trow = data.append("tr");

            for(j=0; j<values.length;j++){
                // for percentage
                
                if(j>0 && j%2 == 0 && values[j][i] > 60)
                    trow.append("td").classed("table-success",true).text(`${values[j][i]}%`)
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
                    trow.append("td").text(values[j][i])
                
                
            }
        }
        
    
});

}

function renderStats(url){

    // Read stats from Flask
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData);
        keys = d3.keys(schema);
        values = d3.values(schema);
        // Get only values from result
        values = values.map(d => d3.values(d));
        console.log(keys);
        console.log(values);
        // Add table data in HTML
        participations = d3.select(".kpi_part").text(values[1]);
        members = d3.select(".kpi_memb").text(values[2]);
        sessions = d3.select(".kpi_sess").text(values[3]);
    }); 

}

