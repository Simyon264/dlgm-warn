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
        if (channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");
        if (serverQueue.stopID.includes(message.author.id)) return message.reply("Du hast bereits abgestimmt.")
        serverQueue.stopID.push(message.author.id)
        serverQueue.stops++

        if (serverQueue.stops >= Math.round(serverQueue.voiceChannel.members.filter(x => x.user.bot == false).size / 2)) {
            const stopped = f.stop(message.guild)
            if (stopped) {
                message.reply(`Verbindung gestoppt.`)
            } else {
                queue = new Map()
                message.reply("Fehler beim Stoppen. (Kann aber trotzdem Funktioniert haben)")
            }
        } else {
            message.reply(`Abgestimmt! (${serverQueue.stops}/${Math.round(serverQueue.voiceChannel.members.filter(x => x.user.bot == false).size / 2)})`)
            queue.set(message.guild.id, serverQueue)
        }

	}
}