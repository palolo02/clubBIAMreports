var dateHash = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function getMonths(numberArray){
    var months = []
    numberArray.forEach(function(m){months.push(dateHash[m-1])});
    return months
}
function getMonthName(index){
    return dateHash[index-1]
}

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