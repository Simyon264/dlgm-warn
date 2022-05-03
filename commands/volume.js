const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'volume',
	description: f.localization("commands","volume","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","volume","exports").usage,
	perms: '',
	alias: ["v"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");
        if (args.length <= 1) return message.reply("Bitte gebe eine neue Lautstärke an.")

        let newVolume = parseInt(args[1])
        if (newVolume == NaN || newVolume == undefined || newVolume == 0) newVolume = 50;
        if (newVolume > 200 || newVolume < 1) newVolume = 50

        serverQueue.source.volume?.setVolume(newVolume / 100)
        serverQueue.volume = newVolume
        queue.set(message.guild.id, serverQueue)
        message.reply(`Lautstärke auf ${newVolume} gesetzt.`)
	}
}