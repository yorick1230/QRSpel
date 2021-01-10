// takes the qrcode data from server and renders it to the user
function createQrPuzzle(rows, cols, qrMatrix){
    var i=0;
    var userSquares = 0;
    var grid = $("#gridTable")[0];
    for (var r=0;r<rows;++r){
        var tr = $("#gridTable").append('<tr>');
        for (var c=0;c<cols;++c){

            if(r > (rows/3) && c > (cols / 3)){
                var cell = $('<td name="'+r+'-'+c+'"><div>&nbsp;</div></td>');
                userSquares++;
            }else{
                var cell = $('<td name="'+r+'-'+c+'"><div>&nbsp;</div></td>');
                qrMatrix[i] === 0 ? $(cell).addClass("whiteBlock") : $(cell).addClass("blackBlock");
            }

            $(tr).append(cell);
            i++;
        }
    }
    return grid;
}

function updateQrPuzzle(squaresToHighlight){
    squaresToHighlight.forEach(square => {

        $("#gridTable td[name='"+square[0]+'-'+square[1]+"']").addClass("blackBlock");
        $("#gridTable td[name='"+square[0]+'-'+square[1]+"']").removeClass("whiteBlock");
        
    });
}

