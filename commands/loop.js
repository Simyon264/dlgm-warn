const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'loop',
	description: f.localization("commands","loop","exports").description,
	category: 'music',
	modcommand: false,
	usage: f.localization("commands","loop","exports").usage,
	perms: '',
	alias: [],
	cooldown: 1,
    run: function (message, prefix, args, client) {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) return message.reply("Ich bin nicht Verbunden.")
        if (!serverQueue.playing) return message.reply("Ich spiele aktuell nichst.")

        let newCategory = args[1]
        let allowed = false
        if (newCategory) newCategory = newCategory.toLowerCase()
        switch (newCategory) {
            case "queue":
                allowed = true;
                message.reply(`Jetzt wird geloopt: Die Songliste :repeat:`)
                break;
            case "song":
                allowed = true;
                message.reply(`Jetzt wird geloopt: Das jetziege lied :repeat_one:`)
                break;
            case "none":
                allowed = true;
                message.reply(`Looping ausgeschaltet!`)
                break;
            default:
                message.reply("Bitte wähle zwichen `queue`, `song` oder `none`")
                break;
        }
        if (allowed) {
            serverQueue.loop = newCategory
            queue.set(message.guild, serverQueue)
        }
    }
}