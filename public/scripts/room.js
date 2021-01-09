$(() => {
	const socket = io();
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

					// check if room is active
					if(response.active === true){



						// do these when all players are ready:
						//$(".qrgamecontent").css('display', 'block');
						//$(".waiting-area").css('display', 'none');
					}
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

	socket.on('connect', (we) => {
		console.log('connected!');
		socket.on('broadcast', (msg) => {
			if(msg.playercount === 1){
				$('.playercountmsg').html(msg.playercount + ' speler verbonden.');
			}else{
				$('.playercountmsg').html(msg.playercount + ' spelers verbonden.');
			}
		});
	});

	socket.on('disconnect', function(){
		console.log('lost connection:'+socket.id);
	});
});