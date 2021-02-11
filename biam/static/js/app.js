console.log('Loading data');

var availableMonths = {}


init();

function init(){
    
    availableYears = [2021,2020];

    availableMonths = 
    [
        /*
    {'year':2021,'month':'2021,05','text':'May 2021'},
    {'year':2021,'month':'2021,04','text':'Abr 2021'},
    {'year':2021,'month':'2021,03','text':'Mar 2021'},
    */
    {'year':2021,'month':'2021,02','text':'Feb 2021'},
    {'year':2021,'month':'2021,01','text':'Ene 2021'},
    /*{'year':2020,'month':'2020,01','text':'Ene 2020'},
    {'year':2020,'month':'2020,02','text':'Feb 2020'},
    {'year':2020,'month':'2020,03','text':'Mar 2020'},
    */
    {'year':2020,'month':'2020,04','text':'Abr 2020'},
    {'year':2020,'month':'2020,05','text':'May 2020'},
    {'year':2020,'month':'2020,06','text':'Jun 2020'},
    {'year':2020,'month':'2020,07','text':'Jul 2020'},
    //{'year':2020,'month':'2020,08','text':'Ago 2020'},
    {'year':2020,'month':'2020,09','text':'Sep 2020'},
    {'year':2020,'month':'2020,10','text':'Oct 2020'},
    {'year':2020,'month':'2020,11','text':'Nov 2020'},
    {'year':2020,'month':'2020,12','text':'Dic 2020'}
    ]

    // Load options for the Year selector
    sel = d3.select("#selYear");
    availableYears.forEach(function(o){
        opt = sel.append("option")
        opt.attr('value',o).text(o);
    });
    
    // Load options for the Month selector
    sel = d3.select("#selMonth");
    availableMonths.forEach(function(o){
        opt = sel.append("option")
        opt.attr('value',o['month']).text(o['text']);
    });
    

    url_data = '/api/v1/getResultsPerDateRange/2021/01';
    rendertable(url_data);
    url_stats = '/api/v1/getStatsPerDateRange/2021/01';
    renderStats(url_stats);
    loadEvents();
}

function loadEvents(){

    d3.select("#selYear").on("change",function(){
        
        year = d3.select("#selYear").property("value");
        // Load options for the Month selector
        sel = d3.select("#selMonth");
        sel.selectAll("option").remove();
        availableMonths.filter(y => y["year"] == year).forEach(element => {
            opt = sel.append("option")
            opt.attr('value',element['month']).text(element['text']);
        });

        option = d3.select("#selMonth").property("value");
        parameters = option.split(',');
        var url = `/api/v1/getResultsPerDateRange/${parameters[0]}/${parameters[1]}`
        console.log(url)
        d3.selectAll("tr").remove();
        rendertable(url);
        var url_stats = `/api/v1/getStatsPerDateRange/${parameters[0]}/${parameters[1]}`
        console.log(url_stats)
        renderStats(url_stats);    
        
    });

    d3.select("#selMonth").on("change",function(){
        option = d3.select("#selMonth").property("value");
        parameters = option.split(',');
        var url = `/api/v1/getResultsPerDateRange/${parameters[0]}/${parameters[1]}`
        console.log(url)
        d3.selectAll("tr").remove();
        rendertable(url);
        var url_stats = `/api/v1/getStatsPerDateRange/${parameters[0]}/${parameters[1]}`
        console.log(url_stats)
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

