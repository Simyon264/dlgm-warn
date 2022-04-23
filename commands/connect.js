const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'connect',
	description: f.localization("commands","connect","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","connect","exports").usage,
	perms: '',
	alias: ["cn", "join"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (serverQueue) return message.reply(`Ich bin bereits Verbunden mit \`${serverQueue.voiceChannel.name}\`.`)
        if (!channel) return message.reply("Du bist in keinen Sprachkanal.")
        const connnect = f.connect(channel, message.channel)
        if (connnect) {
            message.reply(`Verbunden mit \`${channel.name}\``)
        } else {
            message.reply("Fehler beim Verbinden.")
        }
	}
}