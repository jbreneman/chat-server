'use strict';
const config = require('./server/config.js');
const server = require('http').createServer();
const io = require('socket.io')(server, {
	origins: 'http//localhost:* http//127.0.0.1:* netlify.com jessebreneman.com'
});
const chat = require('./server/chat.js');

// Simple in memory store. Yeah this is not a complicated chat app :p

const store = {
	users: [],
	messages: []
};

// Handle all incoming connections. User does not connect to chat until choosing name.
io.on('connection', (socket) => {

	const session = {
		username: null
	};

	// Check against existing users and pass user data back with an available flag
	socket.on('verifyName', (user) => {
		io.to(socket.id).emit('verifyName', Object.assign({}, user, { available: chat.nameAvailable(user.name, store.users) }));
	});

	// Actual user connection - notifies chat and adds to connected users list
	socket.on('userConnect', (user) => {
		user.id = socket.id;
		session.username = user.name;

		if(!user.reconnect) {
			io.to(socket.id).emit('allMessages', { messages: store.messages });
		}

		store.users.push(user);
		store.users.sort();
		io.emit('updateUserlist', { users: store.users });
	});

	// Set name. Mainly used to update name
	socket.on('setName', (user) => {
		store.users.push(user);
		store.users = store.users
			.filter(user => user.name !== session.username)
			.sort();

		session.username = user.name;
		io.emit('updateUserlist', { users: store.users });
	});

	// User disconnect - removes from list
	socket.on('disconnect', () => {
		store.users = store.users.filter(user => user.name !== session.username);
		io.emit('updateUserlist', { users: store.users });
	});

	// User reconnect
	socket.on('reconnect', (socket) => {
		io.to(socket.id).emit('allMessages', { messages: store.messages });

		store.users = store.users.push(session.username).sort();
		io.emit('updateUserlist', { users: store.users });
	});

	// Sends a chat message to client
	socket.on('chatMessage', (message) => {
		const processed = chat.processMessage(message);
		const max = 300;
		const id = store.messages.length > 0 ? store.messages.slice(-1)[0].id + 1 : 0;

		store.messages.push(Object.assign(processed, { id }));
		store.messages = store.messages.slice(0, max);

		io.emit('chatMessage', { message: processed });
	});
	
});

server.listen(config.port, () => {
	console.log('Server started on :' + config.port);
});

//server restart 
process.on('SIGTERM', () => {
	console.log('Server restarting...');
	io.emit('chatMessage', {
		text: 'Server is restarting...',
		refresh: true
	});
	process.exit();
});
