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

        obj = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            obj.push(temp)
        }
        
        obj['Mes'] = getMonths(obj.map(o => o['Mes']))
        // Obtain the Max value from the totals
        maxTotal = Math.max.apply(Math, obj.map(o => o['Total']))
        // Add table data in HTML
        data = d3.select(".data");
        d3.select("#table_results table").classed("table-biam", true)
        // Iterate over each header
        header = data.append("tr")
        keys.forEach(function(h){
            header.append("th").classed('title',true).text(h);
        })
        
        // Add table data in HTML
        data = d3.select(".data");
        obj.forEach(function(row){
            trow = data.append("tr");
            Object.entries(row).forEach(([key, value]) => {
                if(value == null )
                    trow.append("td").text('')
                else if(key == 'Total')
                    trow.append("td").classed('total',true).text(`${value}`)
                else if(key != 'Socios')
                {
                    //perc = value / maxTotal
                    classHeatMap = getHeatMapClassMember(value)
                    trow.append("td").classed(classHeatMap,true).text(`${value}`)
                }
                else
                    trow.append("td").classed('name',true).text(`${value}`)
            });
        });
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
        //participations = d3.select(".kpi_part").text(values[1]);
        members = d3.select(".kpi_memb").text(values[2]);
        sessions = d3.select(".kpi_sess").text(values[3]);
    }); 

}

