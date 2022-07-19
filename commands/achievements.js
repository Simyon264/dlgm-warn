const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    name: 'achievements',
    description: f.localization("commands", "achievements", "exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands", "achievements", "exports").usage,
    perms: '',
    alias: ["acs"],
    cooldown: 1,
    run: async function (message, prefix, args, client) {
        let page = 1
        if (args[1]) {
            let int = parseInt(args[1])
            if (int) {
                if (int > 1) {
                    page = int
                }
            }
        }


        const achievements = JSON.parse(fs.readFileSync("./files/important files/achievements.json"))

        const maxItemsForPage = 5
        const maxpages = Math.ceil(achievements.length / maxItemsForPage)
        if (page > maxpages) page = maxpages;

        const link = await f.getLink(message.author.id)

        let response;
        let wasId = false;
        if (args[2]) {
            wasId = true;
            const id = args[2].split("@")[0]
            response = await f.getSteamInfo(id)
            link.idIngame = response.steamid
        }

        if ((!response || !response.wasFound) && args[2]) {
            return message.reply("Nutzer nicht gefunden.")
        }

        let achievementsLink = []
        if (link) {
            achievementsLink = await f.getAchievements(link.idIngame)
            if (achievementsLink.length !== 0) {
                achievementsLink = JSON.parse(achievementsLink[0].data)
            }
        }

        const embed = new discord.MessageEmbed()
            .setTitle("Alle Achievements")
            .setColor("RANDOM")
            .setFooter({ text: `${achievements.length} Achievements insgesammt. Seite ${page} von ${maxpages}` })
        if (wasId) {
            embed.setThumbnail(response.avatarfull)
        }
        let items = 0
        let count = maxItemsForPage * (page - 1)
        for (let index = 0; index < achievements.length; index++) {
            if (items !== maxItemsForPage) {
                if (count < index || count == index) {
                    items++
                    const element = achievements[index];
                    if (achievementsLink.includes(element.id)) {
                        if (wasId) {
                            embed.addField(element.name, `Beschreibung: ${element.description}\nKategorie: ${element.category}\nID: ${element.id}\n**${response.personaname} hat dieses Achievement.**\n`)
                        } else {
                            embed.addField(element.name, `Beschreibung: ${element.description}\nKategorie: ${element.category}\nID: ${element.id}\n**Du hast dieses Achievement.**\n`)
                        }
                    } else {
                        embed.addField(element.name, `Beschreibung: ${element.description}\nKategorie: ${element.category}\nID: ${element.id}\n`)
                    }
                }
            } else {
                index = achievements.length
            }
        }
        message.reply({
            embeds: [embed]
        })
    }
}