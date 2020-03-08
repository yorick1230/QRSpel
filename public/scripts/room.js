$(() => {

	// get image data
	const canvas = document.querySelector("canvas");
	const ctx = canvas.getContext("2d");

	const image = new Image;

	// create grid from qrcode image
	image.onload = () => {
		ctx.drawImage(image, 0, 0);
		imageData = ctx.getImageData(0, 0, image.width, image.height);
		matrix = jsQR(imageData.data, image.width, image.height);
		var grid = clickableGrid(matrix.extractedRaw.width,matrix.extractedRaw.height, matrix.extractedRaw.data);
	}

	image.src = './testqr.png';

	const urlParams = new URLSearchParams(window.location.search);
	const room = urlParams.get('code');
	
	// check if room exists
	if(room != null && room != ""){
		$.ajax("api/room?code="+room, {
		   type: "GET",
		   statusCode: {
		      200: function (response) {
		         $("#roomCode").text("Room: "+room);
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