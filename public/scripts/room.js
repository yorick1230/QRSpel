$(() => {
	const socket = io();
	const urlParams = new URLSearchParams(window.location.search);
	const room = urlParams.get('code');
	var username;
	

	// check if room exists
	if(room != null && room != ""){
		$.ajax("api/room?code="+room, {
		   type: "GET",
		   statusCode: {
		      200: function (response) {
		         $("#roomCode").text("Room: "+room);
		         	var matrix = atob(response.qrcode);
		         	matrix = JSON.parse(matrix);
					var grid = createQrPuzzle(matrix.width,matrix.height, matrix.data);

					$.ajax("api/username", {
						type: "GET",
						statusCode: {
						   200: function (response) {
							username = response;
							$("#roomSpelerCode").html("Spelercode: "+username);

							// send username to server to link it to the room
							if(socket.connected){
								socket.emit('authenticate', {username: username, roomCode: room});
							}
						   },
						   404: function (response) {
							  console.log("username not found!");
						   }
						}
					 });

					// check if room is active
					if(response.status == "open"){
						// players are waiting for the game to start, show loading screen
						$(".waiting-area").css('display', 'block');
					}else if(response.status == "playing"){
						// game started, show the qrpuzzle
						$(".qrgamecontent").css('display', 'block');
						$(".waiting-area").css('display', 'none');
					}else{
						// game stopped, notify the user
						$(".qrgamecontent").css('display', 'block');
						$(".qrgamecontent").html('<p>Geen room gevonden met deze code.</p>');
						$(".waiting-area").css('display', 'none');
					}
		      },
		      404: function (response) {
				$(".qrgamecontent").css('display', 'block');
				$(".qrgamecontent").html('<p>Geen room gevonden met deze code.</p>');
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

	$("button.spelerCode").click(function(){
		if($("input.spelerCode").val().length === 4){
			socket.emit('exchangeBlocks', {myUserCode: username,userCode: $("input.spelerCode").val(), roomCode: room});
		}
	});

	socket.on('connect', (we) => {
		console.log('connected!');

		// on playercount update
		socket.on('playercount', (msg) => {
			console.log(msg);
			
			if(msg.room == room){
				if(msg.playercount === 0)
					msg.playercount = 1;
				if(msg.playercount === 1){
					$('.playercountmsg').html(msg.playercount + ' speler verbonden.');
				}else{
					$('.playercountmsg').html(msg.playercount + ' spelers verbonden.');
				}
			}
		});

		// receive squares from server
		socket.on('squares', (msg) => {
			console.log('squares!');
			console.log(msg);
			// find user
			var user = msg.roomObj.players.find(user => user.username === username);
			updateQrPuzzle(user.squares);
		});

		// on roomStatus update
		socket.on('roomStatus', (lobby) => {
			console.log('roomStatus!');
			console.log(lobby);
			// check if the updated room is the one we are trying to enter
			if(lobby.roomCode === room){
				// check if the room has closed
				if(lobby.status == "playing"){
					// room is closed, start the game!
					$(".qrgamecontent").css('display', 'block');
					$(".waiting-area").css('display', 'none');
				}

				if(lobby.status == "closed"){
					// game has ended, notify the user
					$(".qrgamecontent").css('display', 'block');
					$(".qrgamecontent").html('<p>Het spel is gestopt door de beheerder.</p>');
					$(".waiting-area").css('display', 'none');
				}
			}
		});
	});

	socket.on('disconnect', function(){
		console.log('lost connection:'+socket.id);
	});
});