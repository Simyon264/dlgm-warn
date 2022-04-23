const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'queue',
	description: f.localization("commands","queue","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","queue","exports").usage,
	perms: '',
	alias: ["q"],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")

        let page = 1
        if (args[1]) {
            let int = parseInt(args[1])
            if (int) {
                if (int > 1) {
                    page = int
                } 
            }
        }

        const maxItemsForPage = 5
        const maxpages = Math.ceil(serverQueue.songs.length / maxItemsForPage)
        if (page > maxpages) page = maxpages;

        let items = 0
        const embed = new discord.MessageEmbed()
            .setTitle(`**__Songliste:__**`)
            .setURL(serverQueue.songs[0].url)
            .setFooter(`Seite ${page}/${maxpages} Größe der Songliste: ${serverQueue.songs.length - 1}`)
            .setColor(0x00AE86)

        if (!serverQueue.songs[0].noinfo) embed.setThumbnail(serverQueue.songs[0].raw.videoDetails.thumbnails[serverQueue.songs[0].raw.videoDetails.thumbnails.length - 1].url)
        let count = maxItemsForPage * (page - 1)
        for (let i = 0; i < serverQueue.songs.length; i++) {
            if (items !== maxItemsForPage) {
                if (count < i || count == i) {
                    items++
                    if (i == 0) {
                        embed.addField(`**__Spielt gerade:__**`, `**${serverQueue.songs[i].title}**`)
                    } else {
                        embed.addField(`**__Song ${i}__**`, `**${serverQueue.songs[i].title}**`)
                    }
                }
            } else {
                i = serverQueue.songs.length
            }
        }

        message.reply({content: "** **", embeds: [embed]})
    }
}