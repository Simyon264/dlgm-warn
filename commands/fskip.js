const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'fskip',
	description: f.localization("commands", "fskip", "exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands", "fskip", "exports").usage,
	perms: 'MANAGE_MESSAGES',
	alias: [],
	cooldown: 1,
	run: function (message, prefix, args, client) {
		const serverQueue = queue.get(message.guild.id);
		if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
		if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")
		if (message.member.voice.channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");

		serverQueue.player.stop();
		message.reply('Geskippt! :thumbsup:')
	}
}