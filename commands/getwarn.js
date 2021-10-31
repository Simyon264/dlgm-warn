const f = require('../functions.js');
const fs = require('fs');
const discord = require('discord.js');
const {
    time
} = require('@discordjs/builders');

module.exports = {
    name: 'getwarn',
    description: "Zeigt dir eine Verwarnung an mit einer WarnID.",
    category: 'warns',
    modcommand: true,
    usage: "getwarn <warn ID>",
    perms: '',
    alias: ["gw"],
    cooldown: 1,
    run: async function(message, prefix, args) {
        if (args.length != 2) return message.reply("Bitte gebe eine WarnID an.")
        if (message.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const sendMessage = await message.reply(f.localization("slashcommands", "getwarn", "wait"))
            const id = parseInt(args[1])
            if (isNaN(id)) return sendMessage.edit("Bitte gebe eine valide WarnID an.")

            let idObj = {
                found: false,
                obj: {},
            }

            const warn = await f.getWarn(id)

            idObj.obj = warn

            if (typeof warn != "undefined") idObj.found = true;

            if (!idObj.found) return sendMessage.edit(f.localization("slashcommands", "getwarn", "notfound", [id]))

            let utcSeconds = idObj.obj.createdAt
            let date = new Date(0)
            date.setUTCSeconds(utcSeconds / 1000)

            const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)

            let expired = ""

            if (idObj.obj.createdAt < timestamp) expired = "\n__**Diese Verwarnung ist abgelaufen**__"

            let type = ""

            if (idObj.obj.type == "steam") type = "@steam"
            if (idObj.obj.type == "discord") type = "@discord"

            const embed = new discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle(f.localization("slashcommands","getwarn","usure",[idObj.obj.name.trim()]))
                .setDescription(f.localization("slashcommands","getwarn","description",[time(date, 'R'), expired]))
                .setFooter(f.localization("slashcommands","getwarn","footer",[idObj.obj.warnid]))
                .addField(f.localization("slashcommands", "getwarn", "field1t"), f.localization("slashcommands", "getwarn", "field1", [idObj.obj.name.trim()]))
                .addField(f.localization("slashcommands","getwarn","field2t"), f.localization("slashcommands","getwarn","field2",[idObj.obj.id.toString().trim(), type]))
                .addField(f.localization("slashcommands","getwarn","field3t"), f.localization("slashcommands","getwarn","field3",[idObj.obj.grund.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field4t"), f.localization("slashcommands", "getwarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field5t"), f.localization("slashcommands", "getwarn", "field5", [idObj.obj.by, idObj.obj.byName]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands", "getwarn", "field6t"), f.localization("slashcommands", "getwarn", "field6", [idObj.obj.extra.toString().trim()]))

            sendMessage.edit({
                content: "** **",
                embeds: [embed]
            })

        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}