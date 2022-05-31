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
    alias: [],
    cooldown: 1,
    run: async function (message, prefix, args, client) {
        const link = await f.getLink(message.author.id)
        if (link) {
            const maxAchievements = JSON.parse(fs.readFileSync("./files/important files/achievements.json")).length
            let achievements = await f.getAchievements(link.idIngame)
            if (achievements.length !== 0) {
                achievements = JSON.parse(achievements[0].data)
            }
            const embed = new discord.MessageEmbed()
                .setTitle("Deine Stats")
                .setColor("RANDOM")
                .setThumbnail(message.author.avatarURL({ dynamic: true }))
                .addField("Achievements", `${achievements.length} von ${maxAchievements}`);

            message.reply({ embeds: [embed] })
        } else {
            message.reply(`Du hast kein Link. Nutze \`${prefix}link\` um dein Discord mit deinem Steam account zu verlinken.`)
        }
    }
}