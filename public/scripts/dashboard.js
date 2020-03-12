$(() => {
	$.ajax({
		type: 'POST',
		url: "api/getAllRooms",
		data: {},
		dataType: "json",
		success: function (result) {
		   console.log(result);
		   for(var i = 0; i < result.length; i++){
				$("#roomsTable").append('<tr><td>'+ result[i].code +'</td><td><button style="float: right;" class="btn btn-success" name="toggleRoomAccess" id="' + 
				result[i].code + '">' + (result[i].active ? 'Stop' : 'Start') + '</button><button name="deleteRoom" style="float: right;" class="btn btn-danger" id="' + 
				result[i].code + '">Delete</button></td></tr>');
		   }		   
			$( "button[name='deleteRoom']" ).click(function(){
				// Delete a room based on room code
				var element = this;
				$.ajax({
					type: 'POST',
					url: "api/deleteRoom",
					data: {roomCode: $(this).attr('id')},
					dataType: "json",
					success: function (result) {
						$(element).closest("tr").remove();
						$(".col-md-12:first").prepend('<div class="alert alert-success" role="alert">Room succesvol verwijdert.</div>');
						setTimeout(function(){
							$('.alert').remove();
							}, 5000);
					},
					error: function(err){
						console.log(err);
					}
				});
			});
			$( "button[name='toggleRoomAccess']" ).click(function(){
				// Delete a room based on room code
				var element = this;
				$.ajax({
					type: 'POST',
					url: "api/toggleRoomAccess",
					data: {roomCode: $(this).attr('id')},
					dataType: "json",
					success: function (result) {
						$(element).text((result.active) ? "Stop" : "Start");
					},
					error: function(err){
						console.log(err);
					}
				});
			});
		},
		error: function(err){
			console.log(err);
		}
	});
	$("#backBtn").click(function(){
		// Logout admin
		$.ajax({
		    type: 'POST',
		    url: "api/logout",
		    data: {},
		    dataType: "json",
		    success: function (result) {
		       location.reload();
		    }
		});
	});

	$("#newRoom").click(function(){
		// create new room and display room code
		$.ajax({
		    type: 'POST',
		    url: "api/room",
		    data: {targeturl: $("#inputUrl").val()},
		    dataType: "json",
		    success: function (result) {
		       console.log(result);
		       $(".col-md-12:first").prepend('<div class="alert alert-success" role="alert">Room succesvol aangemaakt, uw room code is: '+result.code+'</div>');
		    },
		    error: function(err){
		    	console.log(err);
		    }
		});
	});
});