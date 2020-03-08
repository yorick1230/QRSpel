module.exports = function(app, mongoose){

	// #########################   API    ###############################
	var RoomSchema = mongoose.Schema({
	    code: String
	});

	var UserSchema = mongoose.Schema({
	    username: String,
	    password: String
	});


	// model objects in database
	var Room = mongoose.model("Room", RoomSchema, "rooms");
	var User = mongoose.model("User", UserSchema, "users");

	// find a room by code
    app.get('/api/room', (req, res) => {
	  	Room.findOne({code: req.query.code}, function(err, result) {
		  if (result === null || err) {
		    res.sendStatus(404);
		  } else {
		    res.json(result);
		  }
		});
	})

	app.post('/api/room', (req, res) => {
	  var id = generateRoomID();
	  Room.create({code: id}, function(err, result) {
		if (result === null || err) {
		  res.sendStatus(404);
		} else {
		  res.json(result);
		}
	  });
	});

	app.post('/api/auth', (req, res) => {
	 	// check for basic auth header
		if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
			return res.status(401).json({ message: 'Missing Authorization Header' });
		}

		const base64Credentials =  req.headers.authorization.split(' ')[1];
		const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
		const [user, passw] = credentials.split(':');

		User.findOne({username: user}, function(err, result){
			if (result === null || err) {
				res.sendStatus(401);
			} else {
				if(result.password == passw){
					req.session.loggedin = true; // user is loggedin
					res.sendStatus(200);
				}else{
					res.sendStatus(401);
				}
			}
		});

	});

	function generateRoomID() {
		var result           = '';
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < 4; i++ ) {
		   result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	 }

	// #####################  Webpages ##############################
	var path = require('path');
	
	app.get('/', (req, res) => {
	    res.sendfile(path.join(__dirname + '/index.html'));
	})

	app.get('/admin', (req, res) => {
		if(req.session.loggedin){
	    	res.sendfile(path.join(__dirname + '/dashboard.html'));
		}else{
			res.sendfile(path.join(__dirname + '/admin.html'));
		}
	})

	app.get('/dashboard', (req, res) => {
		if(req.session.loggedin){
	    	res.sendfile(path.join(__dirname + '/dashboard.html'));
		}else{
			res.sendfile(path.join(__dirname + '/admin.html'));
		}
	})

	app.get('/room', (req, res) => {
	    res.sendfile(path.join(__dirname + '/room.html'));
	})
}