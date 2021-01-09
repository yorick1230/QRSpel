const qrreader = require('./public/libs/jsQR.js');
const qrgenerator = require('qrcode');
const sizeOf = require('image-size');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas')

module.exports = function(app, mongoose){
	// #########################   API    ###############################
	var RoomSchema = mongoose.Schema({
	    code: String,
	    availableSpots: String,
		qrcode: String,
		active: Boolean,
		url: String
	});

	var UserSchema = mongoose.Schema({
	    username: String,
	    password: String
	});

	// model objects in database
	var Room = mongoose.model("Room", RoomSchema, "rooms");
	var User = mongoose.model("User", UserSchema, "users");

	//hardcoded user for testing purposes.
	User.findOne({username:"test"}, function(err, usr) {
		if (err || usr === null) {
			User.create({username:"test", password:"test"});
		}
	});

	// Delete a room
	app.post('/api/deleteRoom', (req, res) => {
		Room.deleteOne({code: req.body.roomCode}, function(err) {
		if (err) {
			res.sendStatus(404);
		} else {
			return res.status(200).json({ message: 'OK' });
		}
	});
	})

	// toggle the access of a room
	app.post('/api/toggleRoomAccess', (req, res) => {
		Room.findOne({code: req.body.roomCode}, function(err, obj){
			if (obj === null || err) {
				res.sendStatus(404);
			  } else {
				Room.findOneAndUpdate({code: obj.code}, {active: !obj.active}).then(() => res.status(200).json({message: 'OK', active: !obj.active}));;
			  }
		});
	})

	// find a room by code
    app.post('/api/getAllRooms', (req, res) => {
		Room.find({}, function(err, result) {
		if (result === null || err) {
		  res.sendStatus(404);
		} else {
		  res.json(result);
		}
	  });
  	})
	
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
		if(!req.session.loggedin){
			return res.status(401).json({ message: 'You need to be logged in to be able to do this.' });
		}

		// read given url and generate qrcode
		if(req.body.targeturl === "" || req.body.targeturl === null){
			return res.status(404).json({ message: 'Targeturl is required.' });
		}

		// check if temp directory exists

		qrgenerator.toFile('./temp/tmp.png', req.body.targeturl, {version: 4}, function (err) {
			if(err)
				return res.status(404).json({ message: 'Could not generate qrcode.' });

			// get image dimensions
			var dimensions = sizeOf('./temp/tmp.png');

			// convert image to array of binary data
			const canvas = createCanvas(dimensions.width, dimensions.height);
			const ctx = canvas.getContext('2d');

			loadImage('./temp/tmp.png').then((image) => {
				ctx.drawImage(image, 0, 0);
				imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
				matrix = qrreader(imageData.data, dimensions.width, dimensions.height);

				var rows = matrix.extractedRaw.width;
				var cols = matrix.extractedRaw.height;
				var availableSpots = [];
				var i = 0;
			    for (var r=0;r<rows;++r){
			        for (var c=0;c<cols;++c){
			            if(r > (rows/3) && c > (cols / 3)){
			                if(matrix.extractedRaw.data[i] === 1){
			                	// if black square, add to available spots
			                	availableSpots.push([r,c]);
			                }
			            }
			            i++;
			        }
			    }
			    // save all in mongodb
			    var id = generateRoomID();
			    var availableSpots = Buffer.from(JSON.stringify(availableSpots)).toString('base64');
				var squares = Buffer.from(JSON.stringify(matrix.extractedRaw)).toString('base64');
				var url = req.body.targeturl.trim();

			    Room.create({code: id, availableSpots: availableSpots, qrcode: squares, active: false, url}, function(err, result) {
					if (result === null || err) {
						res.sendStatus(404);
					} else {
						res.json(result);
					}
				});
			});
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
					res.status(200).send({status: "OK" });
				}else{
					res.status(401).send({status: "Unauthorized" });
				}
			}
		});
	});

	app.post('/api/logout', (req, res) => {
	 	req.session.loggedin = false;
	 	res.status(200).send({status: "OK" });
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
	    res.sendFile(path.join(__dirname + '/index.html'));
	})

	app.get('/admin', (req, res) => {
		if(req.session.loggedin){
	    	res.sendFile(path.join(__dirname + '/dashboard.html'));
		}else{
			res.sendFile(path.join(__dirname + '/admin.html'));
		}
	})

	app.get('/dashboard', (req, res) => {
		if(req.session.loggedin){
	    	res.sendFile(path.join(__dirname + '/dashboard.html'));
		}else{
			res.sendFile(path.join(__dirname + '/admin.html'));
		}
	})

	app.get('/room', (req, res) => {
	    res.sendFile(path.join(__dirname + '/room.html'));
	})
}