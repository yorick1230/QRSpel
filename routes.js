module.exports = function(app, mongoose){

	// #########################   API    ###############################
	var RoomSchema = mongoose.Schema({
	    code: String
	});

	// model objects in database
	var Room = mongoose.model("Room", RoomSchema, "rooms");

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

	app.get('/room', (req, res) => {
	    res.sendfile(path.join(__dirname + '/room.html'));
	})
}