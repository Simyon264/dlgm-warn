const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const { time } = require('@discordjs/builders');

module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            interaction.editReply(f.localization("slashcommands","getwarn","wait"))
            const id = interaction.options.get('warnid').value
            let idObj = {
                found: false,
                obj: {},
            }

            const warn = await f.getWarn(id)

            idObj.obj = warn

            if (typeof warn != "undefined") idObj.found = true;

            if (!idObj.found) return interaction.editReply(f.localization("slashcommands","getwarn","notfound",[id]))
            
            let utcSeconds = idObj.obj.createdAt
            let date = new Date(0)
            date.setUTCSeconds(utcSeconds / 1000)
            
            let type = ""

            if (idObj.obj.type == "steam") type = "@steam"
            if (idObj.obj.type == "discord") type = "@discord"

            const embed = new discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle(f.localization("slashcommands","getwarn","usure",[idObj.obj.name.trim()]))
                .setDescription(f.localization("slashcommands","getwarn","description",[time(date, 'R')]))
                .setFooter(f.localization("slashcommands","getwarn","footer",[idObj.obj.warnid]))
                .addField(f.localization("slashcommands", "getwarn", "field1t"), f.localization("slashcommands", "getwarn", "field1", [idObj.obj.name.trim()]))
                .addField("Punkte:",`*${idObj.obj.punkte.toString()}*`)
                .addField(f.localization("slashcommands","getwarn","field2t"), f.localization("slashcommands","getwarn","field2",[idObj.obj.id.toString().trim(), type]))
                .addField(f.localization("slashcommands","getwarn","field3t"), f.localization("slashcommands","getwarn","field3",[idObj.obj.grund.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field4t"), f.localization("slashcommands", "getwarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field5t"), f.localization("slashcommands", "getwarn", "field5", [idObj.obj.by, idObj.obj.byName]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands", "getwarn", "field6t"), f.localization("slashcommands", "getwarn", "field6", [idObj.obj.extra.toString().trim()]))
            
            interaction.editReply({ content: "** **", embeds: [embed]})
            
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}