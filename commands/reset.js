const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    name: 'reset',
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
            f.resetStats(link.idIngame);
            message.reply("Deine Daten wurden zurückgesetzt.");
        } else {
            message.reply(`Du hast kein Link. Nutze \`${prefix}link\` um dein Discord mit deinem Steam account zu verlinken.`)
        }
    }
}