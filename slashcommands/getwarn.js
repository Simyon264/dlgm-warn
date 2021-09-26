const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const { time } = require('@discordjs/builders');

module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            interaction.editReply(f.localization("slashcommands","getwarn","wait"))
            const id = interaction.options.get('warnid').value
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
            if (!idObj.found) return interaction.editReply(f.localization("slashcommands","getwarn","notfound",[id]))
            
            let utcSeconds = idObj.obj.createdAt
            let date = new Date(0)
            date.setUTCSeconds(utcSeconds / 1000)
            
            let type = ""

            if (idObj.obj.type == "steam") type = "@steam"
            if (idObj.obj.type == "discord") type = "@discord"

            const embed = new discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle(f.localization("slashcommands","deletewarn","usure",[idObj.obj.name.trim()]))
                .setDescription(f.localization("slashcommands","deletewarn","description",[time(date, 'R')]))
                .setFooter(f.localization("slashcommands","deletewarn","footer",[idObj.obj.warnid]))
                .addField(f.localization("slashcommands","deletewarn","field1t"), f.localization("slashcommands","deletewarn","field1",[idObj.obj.name.trim()]))
                .addField(f.localization("slashcommands","deletewarn","field2t"), f.localization("slashcommands","deletewarn","field2",[idObj.obj.id.trim(), type]))
                .addField(f.localization("slashcommands","deletewarn","field3t"), f.localization("slashcommands","deletewarn","field3",[idObj.obj.grund.toString().trim()]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands","deletewarn","field6t"), f.localization("slashcommands","deletewarn","field6",[idObj.obj.extra.toString().trim()]))
                .addField(f.localization("slashcommands", "deletewarn", "field4t"), f.localization("slashcommands", "deletewarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands","deletewarn","field5t"), f.localization("slashcommands","deletewarn","field5",[idObj.obj.by,idObj.obj.byName]))
            
            interaction.editReply({ content: "** **", embeds: [embed]})
            
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}