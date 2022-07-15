const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    name: 'stats',
    description: f.localization("commands", "stats", "exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands", "stats", "exports").usage,
    perms: '',
    alias: ["stat"],
    cooldown: 1,
    run: async function (message, prefix, args, client) {
        let link = await f.getLink(message.author.id)
        if (link) {
            let wasId = false;
            let response
            if (args.length == 2) {
                wasId = true;
                const id = args[1].split("@")[0]
                response = await f.getSteamInfo(id)
                link.idIngame = response.steamid
            }

            if (!response || !response.wasFound) {
                return message.reply("Nutzer nicht gefunden.")
            }

            const maxAchievements = JSON.parse(fs.readFileSync("./files/important files/achievements.json")).length
            let achievements = await f.getAchievements(link.idIngame)
            if (achievements.length !== 0) {
                achievements = JSON.parse(achievements[0].data)
            }

            const stats = await f.getStats(link.idIngame)

            const embed = new discord.MessageEmbed()
                .setTitle("Deine Stats")
                .setColor("RANDOM")
                .setThumbnail(message.author.avatarURL({ dynamic: true }))
                .addField("Achievements", `${achievements.length} von ${maxAchievements}`);

            if (wasId) {
                embed.setThumbnail(response.avatarfull)
                    .setTitle(`${response.personaname}'s Stats`)
            }

            const statTranslations = {
                "id": "ID",
                "cokesDrunk": "Colas Getrunken:",
                "scpItemsUsed": "SCP Items Genutzt:",
                "pinkCandyKills": "Pink Candy Kills:",
                "assists": "Assists:",
                "kills": "Kills:",
                "alldaylightbits": "Alle DayLight Bits",
                "killDeathRatio": "KD:",
                "deaths": "Tode:",
                "bulletsShot": "Kugeln Geschossen:",
                "scpsKilled": "SCPs Getötet:",
                "poopedAs173": "173 Tantrums Genutzt:",
                "sacrificed106": "Bei 106 Geopfert:",
                "upgraded914": "914 Upgrades:",
                "doorsOpened": "Türen Geöffnet:",
                "doorsClosed": "Türen Geschlossen:",
                "optixKilled": "Optix Getötet:",
                "gotKilledByOptix": "Von Optix Getötet:",
                "bitsspent": "DayLight Bits Ausgegeben:",
                "grenadesThrown": "Granaten Geworfen:",
                "chaosSpawns": "Als Chaos Gespawnt:",
                "NtfSpawns": "Als NTF Gespawnt:",
                "damage": "Schaden:",
                "HidDamage": "HID Schaden:",
                "itemsUsed": "Items Genutzt:"
            }

            for (const key in stats) {
                if (Object.hasOwnProperty.call(stats, key)) {
                    const element = stats[key];
                    const current = statTranslations[key]
                    if (current) {
                        if (element) {
                            embed.addField(current, element.toString().split("@")[0], true)
                        } else {
                            embed.addField(current, "0", true)
                        }
                    }
                }
            }

            message.reply({ embeds: [embed] })
        } else {
            message.reply(`Du hast kein Link. Nutze \`${prefix}link\` um dein Discord mit deinem Steam account zu verlinken.`)
        }
    }
}