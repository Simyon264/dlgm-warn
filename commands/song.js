const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const fetch = require('node-fetch')
module.exports = {
	name: 'song',
	description: f.localization("commands","song","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","song","exports").usage,
	perms: '',
	alias: ["si"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel

        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")

        const songInfo = serverQueue.songs[0]

        const timeLeft = (songInfo.raw.videoDetails.lengthSeconds * 1000) - serverQueue.player._state.playbackDuration

        function formatMilliseconds(milliseconds, padStart) {
            function pad(num) {
                return `${num}`.padStart(2, '0');
            }
            let asSeconds = milliseconds / 1000;

            let hours = undefined;
            let minutes = Math.floor(asSeconds / 60);
            let seconds = Math.floor(asSeconds % 60);

            if (minutes > 59) {
                hours = Math.floor(minutes / 60);
                minutes %= 60;
            }

            return hours
                ? `${padStart ? pad(hours) : hours}:${pad(minutes)}:${pad(seconds)}`
                : `${padStart ? pad(minutes) : minutes}:${pad(seconds)}`;
        }
        fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${songInfo.url.split("=")[1]}`)
            .then(response => response.json())
            .then(data => {
                const embed = new discord.MessageEmbed()
                    .setTitle(`**${songInfo.title}**`)
                    .setURL(songInfo.url)
                    .setColor(0x00AE86)
                    .setDescription(`Zeit verbleibend: **${formatMilliseconds(timeLeft)}**`)
                    .addField('Kanal', `[${songInfo.raw.videoDetails.author.name}](${songInfo.raw.videoDetails.author.channel_url})`, true)
                    .addField('Likes und dislikes', `${data.likes} :thumbsup: ${data.dislikes} :thumbsdown: `, true)
                    .setFooter(`Hinzugefügt von: ${songInfo.by.username}`, songInfo.by.avatarURL(true))
                    .setThumbnail(songInfo.raw.videoDetails.thumbnails[songInfo.raw.videoDetails.thumbnails.length - 1].url)
                message.reply({content: "** **", embeds:[embed]})
            });
	}
}