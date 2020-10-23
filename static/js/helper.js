var dateHash = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function getMonths(numberArray){
    var months = []
    numberArray.forEach(function(m){months.push(dateHash[m-1])});
    return months
}
function getMonthName(index){
    return dateHash[index-1]
}