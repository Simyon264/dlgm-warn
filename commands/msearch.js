const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const ytsr = require('ytsr');
const ytdl = require('ytdl-core')

module.exports = {
	name: 'msearch',
	description: f.localization("commands","search","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","search","exports").usage,
	perms: '',
	alias: ["sr"],
	cooldown: 1,
    run: async function (message, prefix, args, client) {
        const serverQueue = queue.get(message.channel.guild.id);
        const channel = message.member.voice.channel
        args.splice(0, 1);
        
        if (!channel) return message.reply("Du musst ihn einem Sprachkanal sein.")
        if (serverQueue) {
            if (channel.id != queue.get(message.channel.guild.id).voiceChannel.id) return message.reply("Du musst mit dem Bot in einem Sprachkanal sein.");
        }
        
        const botMsg = await message.reply("Suche... :mag:") 

        const filters1 = await ytsr.getFilters(args.join(" "));
        const filter1 = filters1.get('Type').get('Video');
        const searchResults = await ytsr(filter1.url, {
            limit: 10,
        });

        if (searchResults.items.length == 0) return botMsg.edit("Keine Ergebnisse.")
        const menu = new discord.MessageSelectMenu().setCustomId('select').setPlaceholder('Wähle ein Song zum spielen aus!').setMaxValues(1)

        let content = ""

        for (let index = 0; index < searchResults.items.length; index++) {
            content = content + `**${index + 1}** - \`${searchResults.items[index].title}\`\n`
            menu.addOptions([
                {
                    label: `Song ${index + 1}`,
                    description: `Channel: ${searchResults.items[index].author.name}`,
                    value: `${searchResults.items[index].id}`,
                }
            ])
        }

        const row = new discord.MessageActionRow()
            .addComponents(menu)
        botMsg.edit({ content: content, components: [row] })
        const filter = i => {
	        i.deferUpdate();
	        return i.user.id === message.author.id;
        };
        const collector = botMsg.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 60000 });
        
        collector.on('collect', async i => {
	        if (i.user.id === message.author.id) {
                botMsg.edit({ content: '** **', components: [] })
                if (!serverQueue) {
                    if (!f.connect(channel, message.channel)) return botMsg.edit("Fehler beim Verbinden.")
                }
                botMsg.delete()
                f.addSong(message.guild,i.values[0],message)
	        } else {
		        i.reply({ content: `Diese Knöpfe sind nicht für dich!`, ephemeral: true });
	        }
        });
        collector.on('end', collected => {
	        if (collected.size == 0) return botMsg.edit({ content: 'Du hast nicht schnell genug geantwortet.', components: [] })
        });
	}
}