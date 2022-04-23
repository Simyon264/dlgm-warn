const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'stop',
	description: f.localization("commands","stop","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","stop","exports").usage,
	perms: '',
	alias: ["st"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        const stopped = f.stop(message.guild)
        if (stopped) {
            message.reply(`Verbindung gestoppt.`)
        } else {
            message.reply("Fehler beim Stoppen.")
        }
	}
}