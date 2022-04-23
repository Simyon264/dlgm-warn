const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'play',
	description: f.localization("commands","play","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","play","exports").usage,
	perms: '',
	alias: ["p"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel
		args.splice(0, 1);

		if (!serverQueue) {
			if (!f.connect(channel, message.channel)) {
				return message.reply("Fehler beim Verbiden.")
			}
		} 

		if (serverQueue) {
            if (channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");
        }

        if (!channel) return message.reply("Du bist in keinen Sprachkanal.")
        f.addSong(channel.guild,args.join(" "), message)
	}
}