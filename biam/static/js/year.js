console.log('Loading data for year');


init();

function init(){
    loadMemberEvent();
    url_data = '/api/v1/getStatsPerYear/2021';
    renderTableYear(url_data);
    
    
}

// Function to attach a listener event when the dropdown year selection changes
function loadMemberEvent(){

    d3.select("#selYear").on("change",function(){
        option = d3.select("#selYear").property("value");
        url_detailed_data = `/api/v1/getStatsPerYear/${option}`;
        console.log(url_detailed_data)
        renderTableYear(url_detailed_data);
    });
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

        obj = []
        for(i=0; i<values[0].length;i++){
            temp = {}
            for(j=0;j < keys.length; j++){
                temp[keys[j]] = values[j][i]
            }
            obj.push(temp)
        }
        
        obj['Mes'] = getMonths(obj.map(o => o['Mes']))

        // Add table data in HTML
        data = d3.select(".data");
        d3.select("#table_results table").classed("table-biam", true)
        // Remove all content from table
        data.selectAll("*").remove()
        // Iterate over each header
        header = data.append("tr")
        keys.forEach(function(h){
            if(h.includes("%"))
                header.append("th").text('%')
            else
                header.append("th").text(h)
        })

        // Add table data in HTML
        data = d3.select(".data");
        obj.forEach(function(row){
            trow = data.append("tr");
            Object.entries(row).forEach(([key, value]) => {
                // NUll values
                if(value == null )
                    trow.append("td").text('')
                //Percentages
                else if(key.includes('%') && value > 60)
                    trow.append("td").classed("table-success",true).text(`${value}%`)
                else if(key.includes('%') && value >= 30 && value < 60)
                    trow.append("td").classed("table-warning",true).text(`${value}%`)
                else if(key.includes('%') && value < 30)
                    trow.append("td").classed("table-danger",true).text(`${value}%`)
                //Total
                else if(key == 'Total' && value >= 10)
                    trow.append("td").classed("table-success",true).text(`${value}`)
                else if(key == 'Total' && value >= 5 && value < 10)
                    trow.append("td").classed("table-warning",true).text(`${value}`)
                else if(key == 'Total' && value < 5)
                    trow.append("td").classed("table-danger",true).text(`${value}`)
                else
                    trow.append("td").text(`${value}`)
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
        participations = d3.select(".kpi_part").text(values[1]);
        members = d3.select(".kpi_memb").text(values[2]);
        sessions = d3.select(".kpi_sess").text(values[3]);
    }); 

}

