const qrreader = require('./public/libs/jsQR.js');
const qrgenerator = require('qrcode');
const sizeOf = require('image-size');
const { createCanvas, loadImage } = require('canvas')

module.exports = function(app, mongoose, io){
	// #########################   API    ###############################
	var RoomSchema = mongoose.Schema({
	    code: String,
	    availableSpots: String,
		qrcode: String,
		status: String,
		url: String,
		exponential: Boolean,
		redundantie: String
	});

	var UserSchema = mongoose.Schema({
	    username: String,
	    password: String
	});

	// model objects in database
	var Room = mongoose.model("Room", RoomSchema, "rooms");
	var User = mongoose.model("User", UserSchema, "users");

	// check database for active rooms
	var activeRooms = initActiveRooms();

	//hardcoded user for testing purposes.
	// User.findOne({username:"test"}, function(err, usr) {
	// 	if (err || usr === null) {
	// 		User.create({username:"test", password:"test"});
	// 	}
	// });

	// socket.io listening for players
	io.on('connection', (socket) => {
		console.log(`Socket ${socket.id} connected.`);
		
		socket.on('authenticate', (data) => {
			// check if it is a reconnect by checking if the username exists.
			var reconnect = false;
			var roomObj = activeRooms.find(o => o.room.code === data.roomCode);

			console.log('authenticating '+data.username);

			if(roomObj){
				roomObj.players.forEach(function(player){
					if(player.username === data.username){
						reconnect = true;
					}
				});
			}

			// link username and roomcode to the socket
			socket.username = data.username;
			socket.roomCode = data.roomCode;

			// add player to the room if he has not been added yet
			if(roomObj && roomObj.room.status === "open"){
				var added = (roomObj.players.find(user => user.username === data.username)) !== undefined;
				if(!added){
					roomObj.players.push({username: data.username, squares: []});
				}
				io.sockets.emit('playercount',{ playercount: roomObj.players.length, room: data.roomCode});
			}else if(reconnect && roomObj.room.status === "playing"){
				socket.emit('squares',{roomObj: roomObj}); // send current state of game
			}
		});

		socket.on('exchangeBlocks', (data) => {
			var roomObj = activeRooms.find(o => o.room.code === data.roomCode);
			var player1;
			var player2;

			if(roomObj){
				roomObj.players.forEach(function(player){
					if(player.username === data.myUserCode){
						player1 = player;
					}else if(player.username === data.userCode){
						player2 = player;
					}
				});

				if(player1 && player2){
					// calculate amount of squares per player
					const playerCount = roomObj.players.length;
					const buff = Buffer.from(roomObj.room.availableSpots, 'base64');
					const availableSpotsStr = buff.toString('utf-8');
					const availableSpots = eval(availableSpotsStr);
					const squarePerPlayer = Math.floor(availableSpots.length / playerCount);

					// merge array (without dupes) so they get the same squares as other player
					player1.squares = [...new Set([...player1.squares ,...player2.squares.slice(0, squarePerPlayer)])];
					player2.squares = [...new Set([...player2.squares ,...player1.squares.slice(0, squarePerPlayer)])];
				
					if(roomObj.room.exponential === true){
						player1.squares = [...new Set([...player1.squares ,...player2.squares])];
						player2.squares = [...new Set([...player2.squares ,...player1.squares])];
					}

					roomObj.players.forEach(function(player){
						if(player.username === data.myUserCode){
							player = player1;
						}else if(player.username === data.userCode){
							player = player2;
						}
					});

					if(availableSpots.length % player1.squares.length < squarePerPlayer){
						socket.emit('winner',{url: roomObj.room.url});
					}else{
						socket.emit('squares',{roomObj: roomObj}); // send current state of game
					}

					if(availableSpots.length % player2.squares.length < squarePerPlayer){
						io.sockets.sockets.forEach(function(sock){
							if(sock.username === data.userCode){
								sock.emit('winner',{url: roomObj.room.url});
							}
						});
					}else{
						io.sockets.sockets.forEach(function(sock){
							if(sock.username === data.userCode){
								sock.emit('squares',{roomObj: roomObj});
							}
						});
					}
				}
			}
		});

		socket.on('disconnect', () => {
			if(socket.username && socket.roomCode){
				// notify players of the disconnect & remove from the game
				// var room = activeRooms.find(o => o.room.code === socket.roomCode);
				// if(room !== undefined){
				// 	room.players = room.players.filter(e => e.username !== socket.username);
				// 	io.sockets.emit('playercount',{ playercount: room.players.length, room: socket.roomCode});
				// }
			}
			console.log(`Socket ${socket.id} disconnected.`);
		});
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

	app.post('/api/setRedundantie', (req, res) => {
		Room.findOne({code: req.body.roomCode}, function(err, obj){
			var redundantie = req.body.redundantie;
			Room.findOneAndUpdate({code: req.body.roomCode}, {redundantie: redundantie}).then(() => res.status(200).json({redundantie: redundantie}));
		});
	});

	app.post('/api/toggleExponential', (req, res) => {
		Room.findOne({code: req.body.roomCode}, function(err, obj){
			Room.findOneAndUpdate({code: req.body.roomCode}, {exponential: !obj.exponential}).then(() => res.status(200).json({exponential: !obj.exponential}));
		});
	});

	// toggle the access of a room
	app.post('/api/toggleRoomAccess', (req, res) => {
		Room.findOne({code: req.body.roomCode}, function(err, obj){
			if (obj === null || err) {
				res.sendStatus(404);
				return;
			  } else {
				  
				switch(obj.status){
					case "open":
						obj.status = "playing";
						// calculate the qr-code puzzle for the amount of players
						var roomObj = activeRooms.find(o => o.room.code === obj.code);
						roomObj.room.status = "playing";
						if(roomObj !== undefined){
							const playerCount = roomObj.players.length;
							// decode base64 and calculate squares for each player
							const buff = Buffer.from(roomObj.room.availableSpots, 'base64');
							const availableSpotsStr = buff.toString('utf-8');
							const availableSpots = eval(availableSpotsStr);
							const squarePerPlayer = availableSpots.length / playerCount;
							
							var i = 0;
							var player = roomObj.players[0];
							availableSpots.forEach(function(square) {
								if(i !== 0 && i % Math.floor(squarePerPlayer) === 0){
									player = roomObj.players[Math.ceil(i / squarePerPlayer)]; // give squares to next player
								}
								if(player){
									player.squares.push(square);
								}
								i++;
							});

							var dupes = playerCount * (Number(roomObj.room.redundantie) / 100);
							i = 0;
							var nxtPlayr = undefined;
							if(Number(roomObj.room.redundantie) > 0){
								roomObj.players.forEach(function(playr){
									if(nxtPlayr){
										nxtPlayr.squares = [...new Set([...nxtPlayr.squares ,...playr.squares])];
									}
									nxtPlayr = playr;
									i++;
									if(i > dupes){
										nxtPlayr = undefined;
									}
								});
							}

							// send the squares to all clients
							io.sockets.emit('squares',{roomObj: roomObj}); //update clients
						}

						io.sockets.emit('roomStatus',{ roomCode: obj.code, status: obj.status}); //update clients
					break;
					case "playing":
						obj.status = "closed";
						activeRooms = activeRooms.filter(function(el) { return el.room.code != obj.code; }); // remove from active rooms
						io.sockets.emit('roomStatus',{ roomCode: obj.code, status: obj.status}); //update clients
					break;
					case "closed":
						obj.status = "open";
						activeRooms.push({room: obj, players: []}); // add it to active rooms
						req.session.username = undefined; // reset admin's username to make sure he gets a new one when joining a game
					break;
				}

				// update database
				Room.findOneAndUpdate({code: obj.code}, {status: obj.status}).then(() => res.status(200).json({status: obj.status}));
			  }
		});
	})

	// get all rooms
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

	// get the user's username and link it to the given socket, 404 if not set yet
    app.get('/api/username', (req, res) => {
		if(req.session.username){
			res.json(req.session.username);
		}else{
			res.sendStatus(404);
		}
	});

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

			    Room.create({code: id, availableSpots: availableSpots, qrcode: squares, status: "closed", url: url, exponential: false, redundantie: '50'} , function(err, result) {
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

	async function generateUniqueUsername(roomCode){
		var username = generateRoomID();
		var unique = true;

		// find the room the player is joining and check if the username is unique
		await Room.findOne({code: roomCode}, function(err, obj){
			// check if game is waiting for players, no need to generate a name if the game already started or closed
			if(obj.status !== "open"){
				return null;
			}

			//TODO: check if username is unique
			
			// username unique? return it to the user
			if(!unique){
				username = generateUniqueUsername(roomCode);
			}
		});
		return Promise.resolve(username);
	}
	
	// checks the database for games that are 'open' for players to join and adds them to the activeRooms array
	function initActiveRooms(){
		var rooms = [];
		Room.find({status: "open"}, function(err, result) {
			if (result === null || err) {
				console.log(err);
			} else {
				result.forEach(room => {
					rooms.push({room: room, players: []});
				});
			}
		});
		return rooms;
	}

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
		if(req.session.username == null){	
			// generate username if the user is new and the room is open
			generateUniqueUsername(req.query.code).then((user) => {
				req.session.username = user;
				res.sendFile(path.join(__dirname + '/room.html'));
			});
		}else{
			res.sendFile(path.join(__dirname + '/room.html'));
		}
	})
}