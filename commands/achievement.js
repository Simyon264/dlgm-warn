const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    name: 'achievement',
    description: f.localization("commands", "achievement", "exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands", "achievement", "exports").usage,
    perms: '',
    alias: ["ac"],
    cooldown: 1,
    run: async function (message, prefix, args, client) {
        if (args.length > 1) {
            let id = parseInt(args[1])
            let achievement = f.getAchievement(id)
            let valid = false
            if (achievement) {
                if (achievement.id != -1) valid = true
            }
            if (valid) {
                const embed = new discord.MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(achievement.name)
                    .setDescription(achievement.description)
                    .addField("Kategorie:", achievement.category)
                    .setFooter({ text: "ID: " + achievement.id })
                message.reply({ embeds: [embed] })
            } else {
                args.splice(0, 1)
                args = args.join(" ")
                valid = false
                const achievements = JSON.parse(fs.readFileSync("./files/important files/achievements.json"))
                for (let index = 0; index < achievements.length; index++) {
                    const element = achievements[index];
                    if (element.name.toLowerCase() == args.toLowerCase()) {
                        achievement = element
                        valid = true;
                    }
                }
                if (!valid) return message.reply("Achievement nicht gefunden.")
                const embed = new discord.MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(achievement.name)
                    .setDescription(achievement.description)
                    .addField("Kategorie:", achievement.category)
                    .setFooter({ text: "ID: " + achievement.id })
                message.reply({ embeds: [embed] })
            }
        } else {
            message.reply("Bitte gebe eine Achievement an.")
        }
    }
}