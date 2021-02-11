/*
Author: Paolo Vega
Last Update: Feb 10, 2021
Change: Add comments to functions 
Version: 1.0.5
*/

// Names for all the months
var dateHash = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

/*
Function: getMonths
Objective: Retrieve the name of all months specified by a number [1,2,3,...] = ['Ene','Feb','Mar',..]
Parameters: array of Numbers where each number is a month [1,2,3,4...]
*/
function getMonths(numberArray){
    var months = []
    numberArray.forEach(function(m){months.push(dateHash[m-1])});
    return months
}

/*
Function: getMonthName
Objective: Retrieve the name of any month specified by its number [1,='Ene',2 ='Feb',3 = 'Mar',...
Parameters: number that indicates a month (1-12)
*/
function getMonthName(index){
    return dateHash[index-1]
}

/*
Function: getHeatMapClass
Objective: Return a css class for acummulated participations depending on their percentage
Parameters: number that indicates a percentage [0-1]
*/
function getHeatMapClass(per){
    if(per <= 0.25)
        return 'b0';
    if (per > 0.25 && per <= 0.5)
        return 'b25'
    if (per > 0.5 && per <= 0.75)
        return 'b50';
    if (per > 0.75)
        return 'b75'
}

/*
Function: getHeatMapClassMember
Objective: Return a css class for individual participations depending on their percentage
Parameters: number that indicates member participations [1-5]
*/
function getHeatMapClassMember(participations){
    if(participations == 1)
        return 'b0';
    if (participations == 2)
        return 'b25'
    if (participations == 3)
        return 'b50';
    if (participations > 3)
        return 'b75';
}