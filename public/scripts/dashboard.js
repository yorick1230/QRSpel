$(() => {
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