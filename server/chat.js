'use strict';

module.exports = {
	nameAvailable(name, users) {
		return users
			.map(user => user.name.toLowerCase())
			.includes(name.toLowerCase());
	},

	escapeHtml(message) {
		message.text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');

		return message;
	},

	parseCommand(message) {
		const commands = ['/me'];
		const firstWord = message.text.split(' ')[0].toLowerCase();

		if (commands.includes(firstWord)) {
			return Object.assign({}, data, { command: commands.filter(command => command === firstWord)[0] });
		}

		return message;
	},

	processMessage(message) {
		return this.parseCommand(this.escapeHtml(message));
	}
};
