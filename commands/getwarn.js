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
            const dir = fs.readdirSync("./files/warns")
            let idObj = {
                found: false,
                obj: {},
                filename: "",
                indexPosition: 0
            }
            let file
            for (let index = 0; index < dir.length; index++) {
                if (dir[index] != "id.txt") {
                    file = JSON.parse(fs.readFileSync(`./files/warns/${dir[index]}`))
                    let indexC = 0
                    file.forEach(element => {
                        indexC++
                        if (element.warnid == id) {
                            idObj.found = true
                            idObj.obj = element
                            idObj.filename = dir[index]
                            idObj.indexPosition = indexC
                        }
                    });
                    if (idObj.found) break
                }
            }
            if (!idObj.found) return sendMessage.edit(f.localization("slashcommands", "getwarn", "notfound", [id]))

            let utcSeconds = idObj.obj.createdAt
            let date = new Date(0)
            date.setUTCSeconds(utcSeconds / 1000)

            let type = ""

            if (idObj.obj.type == "steam") type = "@steam"
            if (idObj.obj.type == "discord") type = "@discord"

            const embed = new discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle(f.localization("slashcommands", "getwarn", "usure", [idObj.obj.name.trim()]))
                .setDescription(f.localization("slashcommands", "getwarn", "description", [time(date, 'R')]))
                .setFooter(f.localization("slashcommands", "getwarn", "footer", [idObj.obj.warnid]))
                .addField(f.localization("slashcommands", "getwarn", "field1t"), f.localization("slashcommands", "getwarn", "field1", [idObj.obj.name.trim()]))
                .addField("Punkte:", `*${idObj.obj.punkte.toString()}*`)
                .addField(f.localization("slashcommands", "getwarn", "field2t"), f.localization("slashcommands", "getwarn", "field2", [idObj.obj.id.trim(), type]))
                .addField(f.localization("slashcommands", "getwarn", "field3t"), f.localization("slashcommands", "getwarn", "field3", [idObj.obj.grund.toString().trim()]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands", "getwarn", "field6t"), f.localization("slashcommands", "getwarn", "field6", [idObj.obj.extra.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field4t"), f.localization("slashcommands", "getwarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field5t"), f.localization("slashcommands", "getwarn", "field5", [idObj.obj.by, idObj.obj.byName]))

            sendMessage.edit({
                content: "** **",
                embeds: [embed]
            })

        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}