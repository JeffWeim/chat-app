'use strict';

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// HANDLERS

exports.listen = function (server) {
	//start Socket.IO server; piggybacking existing HTTP server
	io = socketio.listen(server);
	io.set('log level', 1);

	//Define how each user connection is handled
	io.sockets.on('connection', function(socket) {
		//Asign iser a guest name when they connect
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed); // defined line 40
		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);

		//if user types command 'rooms', show them list of available rooms
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		});

		//handles logic for when user disconnects
		handleClientDisconnection(socket, nickNames, namesUsed);

	});
};

// HELPER FUNCTIONS

function assignGuestNames(socket, guestNumber, nickNames, namesUsed) { // called line 20
	// automatically generate an assigned username
	var name = 'Guest' + guestNumber;
	// associate the assinged guest name with client connection ID
	nickNames[socket.id] = name;
	// emit/broadcast to user their username
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	// declare that guestname is now used
	namesUsed.push(name); // push() -> adds new item to end of any array
	// increment the counter used for creating guest names
	return guestNumber + 1;
}

function joinRoom(socket, room) { // called line 21
	socket.join(room);
	// set user's socket.id to currentRoom
	currentRoom[socket.id] = room;
	// Tell user what room they're in
	socket.emit('joinResult', {room: room});
	// broadcast to entire room that "nickNames" has joined the room
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + ': '
	});

	//determine what other users are in same room as user
	var usersInRoom = io.sockets.clients(room);
	//if their are other users, state how many
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for (var index in usersInRoom) {
			var usersSocketId = usersInRoom[index].id;
			if (usersSocketId != socket.io) {
				if (index > 0) {
					usersInRoomSumary += ', ';
				}
				usersInRoomSumary += nickNames[usersSocketId];
			}
		}
		usersInRoomSumary += '.';
		//send to room summary of other users in the room
		socket.emit('message', {text: usersInRoomSumary});
	}
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) { // called on line 24
	// listener that listens for nameAttempt events
	socket.on('nameAttempt', function (name) {
		// if statement to stop nicknames from beginning with 'Guest'
		if (name.indexOf('Guest') == 0) { // indexOf() -> returns the position of the first occurrence of a specified value in a string
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});
		} else {
			// if name isn't already in use, register the new name
			if (namesUsed.indexOf(name) == - 1) { // indexOf() -> returns -1 if the value to search for never occurs.
				var previousName = nickNames[socket.id]; // nickNames is a variable object
				var previousNameIndex = namesUsed.indexOf(previousName); // nameUsed is a variable array
				namesUsed.push(name); // put new name at the end of the array namesUsed[]
				nickNames[socket.id] = name; // assign client connection ID to the new name
				// remove previous name to make available to other clients
				delete namesUsed[previousNameIndex];
				socket.emit('nameResult', {
					success: true,
					name: name 
				});
				socket.broadcast.to(currentRoom[socket.id].emit('message'), {
					text: previousName + ' is now know as ' + name + '!'
				});
			} else {
				// send error to client if name is a lready registered
				socket.emit('nameResult', {
					succes: false,
					message: 'That name is already in use.'
				});
			}
		}
	});
}

function handleMessageBroadcasting(socket) { // called on line 23
	socket.on('message', function(message) {
		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + ': ' + message.text
		});
	});
}

function handleRoomJoining(socket) {
	socket.on('join', function (room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}