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
	io.sockets.on('connection', function(soclet) {
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

function assignGuesNames(socket, guestNumber, nickNames, namesUsed) { // called line 20
	//automatically generate an assigned username
	var name = 'Guest' + guestNumber;
	//associate the assinged guest name with client connection ID
	nickNames[socket.io] = name;
	//emit/broadcast to user their username
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	//declare that guestname is now used
	namesUsed.push(name);
	//increment the counter used for creating guest names
	return guestNumber + 1;
}

function joinRoom(socket, room) { // called line 21
	socket.join(room);
	//set user's socket.id to currentRoom
	currentRoom[socket.id] = room;
	//Tell user what room they're in
	socket.emit('joinResult', {room: room});
	//broadcast to entire room that "nickNames" has joined the room
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + ': ';
	});

	//determine what other users are in same room as user
	var usersInRoom = io.sockets.clients(room);
	//if their are other users, state how many
	if (usersInRoom.length > 1) {
		var usersInRoomSumary = 'Users currently in ' + room + ': ';
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

function

