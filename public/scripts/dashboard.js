$(() => {
	$.ajax({
		type: 'POST',
		url: "api/getAllRooms",
		data: {},
		dataType: "json",
		success: function (result) {
		   var colors = {open: "green", playing: "blue", closed: "red"}
		   var exponentials = {true: "✔", false: "❌"}
		   for(var i = 0; i < result.length; i++){
			//    console.log(result[i]);
				$("#roomsTable").append('<tr><td>'+ result[i].code +
				'</td><td>'+ result[i].url +
				'</td><td><button style="float: right; background-color:'+colors[result[i].status]+'" class="btn btn-success" name="toggleRoomAccess" id="' + 
				result[i].code + '">' + result[i].status + '</button><button name="deleteRoom" style="float: right;" class="btn btn-danger" id="' + 
				result[i].code + '">Delete</button><button style="float: right; background-color: green; color: white;" class="btn btn-succes" id="' + 
				result[i].code + '" name="shareExponentially">Exponentieel: '+exponentials[result[i].exponential]+'</button><button style="float: right; background-color: blue; color: white;" class="btn btn-succes" id="' + 
				result[i].code + '" name="Redundantie">Redundantie: '+result[i].redundantie+'</button><button style="float: right; background-color: #c79f32; color: white;" class="btn btn-succes" id="' + 
				result[i].code + '" name="Vragen">Vragen: '+result[i].questions.length+'</button></td></tr>');
		   }

		   $( "#saveQuestions" ).click(function(){
				$("button[name='QuestionDelete']").remove();
				var questionsArr = [];
				let list = document.getElementById("questionsList").querySelectorAll('li');

				list.forEach((item, index) => {
					questionsArr.push(item.innerText);
				});
				
				$.ajax({
					type: 'POST',
					url: "api/saveQuestions",
					data: {roomCode: document.getElementById("questionsList").getAttribute('name'), questions: JSON.stringify(questionsArr)},
					dataType: "json",
					success: function (result) {
						console.log("Questions saved!");
						location.reload();
					}, error: function(err){
						console.log(err)
					}
				});
		   });

		   $( "button[name='addQuestionToList']" ).click(function(){
			if($("input[name='questionInput']").first().val().length > 0 && $("input[name='questionInput']").first().val().length < 1000){
				$("#questionsList").append($("<li>").attr("class","list-group-item").text($("input[name='questionInput']").first().val()));

				$("input[name='questionInput']").first().val('');
			}
		   });

			$( "button[name='Vragen']" ).click(function(){
				var element = this;
				$(".bd-questions-modal-lg").modal('show');
				$("#questionsList").empty();
				for(var i = 0; i < result.length; i++){
					if(result[i].code === this.id){
						result[i].questions.forEach(element => {
							$("#questionsList").append('<li class="list-group-item">'+element.question+'<button type="button" class="btn btn-secondary" style="float: right; background-color: red; color: white;" name="QuestionDelete">Delete</button></li>');
						});
						$("#questionsList").attr('name', this.id);
					}
				}
				$("button[name='QuestionDelete']" ).click(function(){
					$(this).parent().remove();
				});
			});

		   $( "button[name='Redundantie']" ).click(function(){
			var element = this;
			$(".bd-example-modal-lg").modal('show');

			var slider = document.getElementById("myRange");
			var output = document.getElementsByClassName("percent");
			update();
			
			slider.oninput = function() {
			  update();
			}
			function update() {
			  var arr = Array.prototype.slice.call(output);
			  for (var el of arr) {
				el.innerHTML = slider.value;
			  }
			}
			$("#savePercentage").click(function(){
				$.ajax({
					type: 'POST',
					url: "api/setRedundantie",
					data: {roomCode: $(element).attr('id'), redundantie: $(".percent").html()},
					dataType: "json",
					success: function (result) {
						$(element).html("Redundantie: "+result.redundantie);
					},
					error: function(err){
						console.log(err);
					}
				});
			});
	   });

		   $( "button[name='shareExponentially']" ).click(function(){
				var element = this;
				$.ajax({
					type: 'POST',
					url: "api/toggleExponential",
					data: {roomCode: $(this).attr('id')},
					dataType: "json",
					success: function (result) {
						$(element).html("Exponentieel: "+exponentials[result.exponential]);
					},
					error: function(err){
						console.log(err);
					}
				});
		   });

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
						$(".col-md-12:first").prepend('<div class="alert alert-success" role="alert">Room succesvol verwijderd.</div>');
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
					data: {roomCode: $(element).attr('id')},
					dataType: "json",
					success: function (result) {

						switch(result.status){
							case "open":
								$(element).css("background-color", "green");
							break;
							case "playing":
								$(element).css("background-color", "blue");
							break;
							case "closed":
								$(element).css("background-color", "red");
							break;
						}
						$(element).text(result.status);
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
			   location.reload();
		    },
		    error: function(err){
		    	console.log(err);
		    }
		});
	});
});