'use strict';

module.exports = {
	nameAvailable(name, users) {
		return users
			.map(user => user.name.toLowerCase())
			.includes(name.toLowerCase());
	},

	escapeHtml: function(unsafe) {
		return unsafe
	     .replace(/&/g, '&amp;')
	     .replace(/</g, '&lt;')
	     .replace(/>/g, '&gt;')
	     .replace(/"/g, '&quot;')
	     .replace(/'/g, '&#039;');
	},

	parseCommand(message) {
		const commands = ['/me'];
		const firstWord = message.text.split(' ').slice(0, 1).toLowerCase();

		if (commands.includes(firstWord)) {
			return Object.assign({}, data, { command: commands.filter(command => command === firstWord).slice(0, 1) });
		}

		return data;
	},

	processMessage(message) {
		return parseCommand(escapeHtml(message));
	}
};
