// copied and modified ~ http://jsfiddle.net/roman_murashov/vxdfLxft/

var lastClicked;
var grid = clickableGrid(18,18);
     
function clickableGrid( rows, cols ){
    var i=0;
    var alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    var grid = $("#gridTable")[0];
    for (var r=0;r<rows;++r){
        var tr = $("#gridTable").append('<tr>');
        for (var c=0;c<cols;++c){
        	var cell = $('<td name='+alphabet[r]+c+'>'+alphabet[r]+(c+1)+'</td>');
        	$(tr).append(cell);
        	console.log(cell);
        	$(cell).click(function(el){
                $(el.target).toggleClass('clicked');
            });
        }
    }
    return grid;
}