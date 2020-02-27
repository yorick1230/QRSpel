// copied and modified ~ http://jsfiddle.net/roman_murashov/vxdfLxft/

var lastClicked;
var grid = clickableGrid(15,15);
     
function clickableGrid( rows, cols ){
    var i=0;
    var grid = $("#gridTable")[0];
    for (var r=0;r<rows;++r){
        var tr = $("#gridTable").append('<tr>');
        for (var c=0;c<cols;++c){
        	var cell = $('<td name='+i+++'>');
        	$(tr).append(cell);
        	console.log(cell);
        	$(cell).click(function(el){
                $(el.target).toggleClass('clicked');
            });
        }
    }
    return grid;
}