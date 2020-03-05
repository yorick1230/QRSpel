// copied and modified ~ http://jsfiddle.net/roman_murashov/vxdfLxft/

function clickableGrid(rows, cols, qrMatrix){
    var showCoords = false;
    var i=0;
    var alphabetCount = 0;
    var alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    var grid = $("#gridTable")[0];
    for (var r=0;r<rows;++r){
        var tr = $("#gridTable").append('<tr>');
        if(r > (rows / 3)){
            alphabetCount++;
        }
        for (var c=0;c<cols;++c){

            if(r > (rows/3) && c > (cols / 3)){
                if(showCoords){
        	        var cell = $('<td><div>'+alphabet[alphabetCount-1]+((c - (cols / 3))+1)+'</div></td>');
                }
                else{
                    var cell = $('<td><div>&nbsp;</div></td>');
                }
            }else{
                var cell = $('<td><div>&nbsp;</div></td>');
                qrMatrix[i] === 0 ? $(cell).addClass("whiteBlock") : $(cell).addClass("blackBlock");
            }

        	$(tr).append(cell);
        	$(cell).click(function(el){
                $(el.target).toggleClass('clicked');
            });
            i++;
        }
    }
    return grid;
}

