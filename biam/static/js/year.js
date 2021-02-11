/*
Author: Paolo Vega
Last Update: Feb 10, 2021
Change: Add comments to functions 
Version: 1.0.5
*/


init();

/*
Function: init
Objective: Set all initial API request to render data
Parameters: None
Remarks: Currently, we need to specify year (2021) to render the results
*/
function init(){
    loadMemberEvent();
    url_data = '/api/v1/getStatsPerYear/2021';
    renderTableYear(url_data);
}

/*
Function: loadMemberEvent
Objective: Define API requests according to selected year filter 
Parameters: None
*/
function loadMemberEvent(){

    d3.select("#selYear").on("change",function(){
        option = d3.select("#selYear").property("value");
        url_detailed_data = `/api/v1/getStatsPerYear/${option}`;
        renderTableYear(url_detailed_data);
    });
}

/*
Function: renderTableYear
Objective: Render the cummulated participations of active memmbers in a year
Parameters: API url
*/
function renderTableYear(url){

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
        // Obtain the name of the months
        obj['Mes'] = getMonths(obj.map(o => o['Mes']))

        // Add table data in HTML
        data = d3.select(".data");
        d3.select("#table_results table").classed("table-biam", true)
        // Remove all content from table
        data.selectAll("*").remove()
        header = data.append("tr")
        keys.forEach(function(h){
            // Append a % to any number to show it as perecentage
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
                // Evaluate if it's a NUll value
                if(value == null )
                    trow.append("td").text('')
                // Evaluaate if we are showing percetages to add custom css class for visualization
                // [60,100]
                else if(key.includes('%') && value > 60)
                    trow.append("td").classed("table-success",true).text(`${value}%`)
                // [30,60) 
                else if(key.includes('%') && value >= 30 && value < 60)
                    trow.append("td").classed("table-warning",true).text(`${value}%`)
                // [0,30)
                else if(key.includes('%') && value < 30)
                    trow.append("td").classed("table-danger",true).text(`${value}%`)
                // Total [10,)
                else if(key == 'Total' && value >= 10)
                    trow.append("td").classed("table-success",true).text(`${value}`)
                // Total [5,10)
                else if(key == 'Total' && value >= 5 && value < 10)
                    trow.append("td").classed("table-warning",true).text(`${value}`)
                // Total [0,5)
                else if(key == 'Total' && value < 5)
                    trow.append("td").classed("table-danger",true).text(`${value}`)
                // For any other text
                else
                    trow.append("td").text(`${value}`)
            });
        });
    
});

}

/*
Function: renderStats
Objective: Render No of members and No of sessions in a month at the top pf the webpage
Parameters: API url
*/
function renderStats(url){
    // Read stats from request
    d3.json(url).then((incomingData) =>{
        //Parse JSON result
        schema = JSON.parse(incomingData);
        keys = d3.keys(schema);
        values = d3.values(schema);
        // Get only values from result
        values = values.map(d => d3.values(d));
        // Add table data in HTML
        participations = d3.select(".kpi_part").text(values[1]);
        members = d3.select(".kpi_memb").text(values[2]);
        sessions = d3.select(".kpi_sess").text(values[3]);
    }); 

}

