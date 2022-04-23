const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'skip',
	description: f.localization("commands","skip","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","skip","exports").usage,
	perms: '',
	alias: [],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")

        if (message.member.voice.channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");
        if (serverQueue.skipID.includes(message.author.id)) return message.reply("Du hast bereits abgestimmt.")
        serverQueue.skipID.push(message.author.id)
        serverQueue.skips++
    
        if (serverQueue.skips >= Math.round(serverQueue.voiceChannel.members.size / 2)) {
            serverQueue.player.stop();
            message.reply('Geskippt! :thumbsup:')
        } else {
            message.reply(`Abgestimmt! (${serverQueue.skips}/${Math.round(serverQueue.voiceChannel.members.size / 2)})`)
            queue.set(message.guild.id, serverQueue)
        }
    }
}