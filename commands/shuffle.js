const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'shuffle',
	description: f.localization("commands","shuffle","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","shuffle","exports").usage,
	perms: '',
	alias: [],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")

        if (message.member.voice.channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");
        
        function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        

        let curSong = serverQueue.songs.splice(0, 1)[0]
        let newArray = serverQueue.songs
        shuffleArray(newArray)
        newArray.splice(0, 0, curSong)
        serverQueue.songs = newArray;
        queue.set(message.guild.id, serverQueue)
        message.reply("Die Songliste wurde gemischt.");
    }
}