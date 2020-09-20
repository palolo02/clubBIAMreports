console.log('Loading data');


init();

function init(){
    url_data = '/api/v1/getResultsPerDateRange/2020/04';
    rendertable(url_data);
    url_stats = '/api/v1/getStatsPerDateRange/2020/04';
    renderStats(url_stats);
    loadEvents();
}

function loadEvents(){

    d3.select("#selMes").on("change",function(){
        option = d3.select("#selMes").property("value");
        parameters = option.split(',');
        var url = `/api/v1/getResultsPerDateRange/${parameters[0]}/${parameters[1]}`
        d3.selectAll("tr").remove();
        rendertable(url);
        var url_stats = `/api/v1/getStatsPerDateRange/${parameters[0]}/${parameters[1]}`
        renderStats(url_stats);
    });
}


function rendertable(url){

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
                if(j>0 && values[j][i]>=3)
                    trow.append("td").classed("table-success",true).text(values[j][i])
                else if(j == values.length-1 && values[j][i]==2)
                    trow.append("td").classed("table-warning",true).text(values[j][i])
                else if(j == values.length-1 && values[j][i]==1)
                    trow.append("td").classed("table-danger",true).text(values[j][i])
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

