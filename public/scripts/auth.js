$(() => {

	$("#loginBtn").click(function(){
		var user = $("#inputUser").val();
		var passw = $("#inputPassword").val();

		// check if correct login
		var authorizationBasic = window.btoa(user + ':' + passw);

		$.ajax({
		    type: 'POST',
		    url: "api/auth",
		    data: {},
		    dataType: "json",
		    contentType: 'application/x-www-form-urlencoded',
		    // crossDomain: true,
		    headers: {
		       'Authorization': 'Basic ' + authorizationBasic
		    },
		    //beforeSend: function (xhr) {
		    //},
		    success: function (result) {
		       location.reload();
		    },
		    //complete: function (jqXHR, textStatus) {
		    //},
		    error: function (req, status, error) {
		    	if(req.status === 401){
		    		$(".form-signin").prepend('<div class="alert alert-warning" role="alert">Verkeerde gebruikersnaam of wachtwoord.</div>');
		    	}
		    }
		});
		return false;
	});
});