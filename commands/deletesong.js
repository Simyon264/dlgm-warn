const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'deletesong',
	description: f.localization("commands","deletesong","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","deletesong","exports").usage,
	perms: '',
	alias: ["ds"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")
        if (message.member.voice.channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");

        let song
        if (args[1]) {
            let int = parseInt(args[1])
            if (int) {
                if (int >= 1) {
                    song = int
                } 
            }
        }

        if (!song) return message.reply("Bitte gebe eine Nummer an.")
        if (song == 0) return message.reply("Wenn du Nummer 0 löschen möchstes, skippe einfach!")
    
        const songINF = serverQueue.songs[song]
        serverQueue.songs.splice(song, 1)
        message.reply(`\`${songINF.title}\` entfernt!`)
        queue.set(message.guild.id, serverQueue)
    }
}