// copied and modified ~ http://jsfiddle.net/roman_murashov/vxdfLxft/

function clickableGrid(rows, cols, qrMatrix){
    var i=0;
    var grid = $("#gridTable")[0];
    for (var r=0;r<rows;++r){
        var tr = $("#gridTable").append('<tr>');
        for (var c=0;c<cols;++c){

            if(r > (rows/3) && c > (cols / 3)){
                var cell = $('<td><div>&nbsp;</div></td>');
            }else{
                var cell = $('<td><div>&nbsp;</div></td>');
                qrMatrix[i] === 0 ? $(cell).addClass("whiteBlock") : $(cell).addClass("blackBlock");
            }

        	$(tr).append(cell);
            i++;
        }
    }
    return grid;
}

