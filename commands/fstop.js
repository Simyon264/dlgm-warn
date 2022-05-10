const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'fstop',
	description: f.localization("commands","fstop","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","fstop","exports").usage,
	perms: 'MANAGE_MESSAGES',
	alias: [],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");

        const stopped = f.stop(message.guild)
        if (stopped) {
            message.reply(`Verbindung gestoppt.`)
        } else {
            queue = new Map()
            message.reply("Fehler beim Stoppen. (Kann aber trotzdem Funktioniert haben)")
        }
	}
}