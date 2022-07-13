const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    name: 'unlink',
    description: f.localization("commands", "unlink", "exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands", "unlink", "exports").usage,
    perms: '',
    alias: [],
    cooldown: 1,
    run: async function (message, prefix, args, client) {
        const link = await f.getLink(message.author.id)
        if (link !== undefined) {
            discordDB.exec(`DELETE FROM "main"."links" WHERE "idDiscord" LIKE '%${message.author.id}%' ESCAPE '/'`, (err) => {
                if (err) {
                    return message.reply("`" + err.message + "`")
                } else message.reply("Link aufgelöst.")
            })
        } else {
            message.reply("Du bist nicht verlinkt.")
        }
    }
}