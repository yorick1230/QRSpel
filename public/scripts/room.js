$(() => {

	const urlParams = new URLSearchParams(window.location.search);
	const room = urlParams.get('code');
	// check if room exists
	if(room != null && room != ""){
		$.ajax("api/room?code="+room, {
		   type: "GET",
		   statusCode: {
		      200: function (response) {
		         $("#roomCode").text("Room: "+room);

		         	var matrix = atob(response.qrcode);
		         	matrix = JSON.parse(matrix);
					var grid = clickableGrid(matrix.width,matrix.height, matrix.data);
		      },
		      404: function (response) {
		         alert('Geen room gevonden met deze code');
		      }
		   }
		});
	}

	$("#backBtn").click(function(){
		var confirm = window.confirm("Weet je zeker dat je terug wilt gaan?");
		if(confirm){
			window.location.href = "./";
		}
	});
});