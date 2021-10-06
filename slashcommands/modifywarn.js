const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const { time } = require('@discordjs/builders');

module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const id = interaction.options.get('warnid').value
            const change = interaction.options.get("change").value
            const newVaule = interaction.options.get("neuerwert").value

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
            if (!idObj.found) return interaction.editReply(f.localization("slashcommands", "getwarn", "notfound", [id]))

            const oldName = idObj.obj.name
            let old = idObj.obj[change]
            if (typeof old == "undefined") old = "Nichts"

            switch (change) {
                case "punkte":
                    const newNumber = Math.round(parseFloat(newVaule.toString().replace(",", ".")) * 10) / 10
                    if (isNaN(newNumber)) return interaction.editReply("Bitte gebe eine Nummer ein.")
                    idObj.obj["punkte"] = newNumber
                    break;
                default:
                    idObj.obj[change] = newVaule
                    break;
            }
            
            let type = ""

            if (idObj.obj.type == "steam") type = "@steam"
            if (idObj.obj.type == "discord") type = "@discord"
            
            const embed = new discord.MessageEmbed()
                .setTitle("Verwarnung geändert!")
                .setDescription(`**Verwarnung für \`${oldName.trim()}\`**\n\n\`${old.trim()}\` wurde zu \`${idObj.obj[change].toString().trim()}\`\n\n`)
                .setColor(0x00AE86)
                .setFooter(f.localization("slashcommands","getwarn","footer",[idObj.obj.warnid]))
                .addField(f.localization("slashcommands", "getwarn", "field1t"), f.localization("slashcommands", "getwarn", "field1", [idObj.obj.name.trim()]))
                .addField("Punkte:",`*${idObj.obj.punkte.toString()}*`)
                .addField(f.localization("slashcommands","getwarn","field2t"), f.localization("slashcommands","getwarn","field2",[idObj.obj.id.trim(), type]))
                .addField(f.localization("slashcommands","getwarn","field3t"), f.localization("slashcommands","getwarn","field3",[idObj.obj.grund.toString().trim()]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands","getwarn","field6t"), f.localization("slashcommands","getwarn","field6",[idObj.obj.extra.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field4t"), f.localization("slashcommands", "getwarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands","getwarn","field5t"), f.localization("slashcommands","getwarn","field5",[idObj.obj.by,idObj.obj.byName]))
            
            interaction.editReply({
                embeds: [embed]
            })

            file = JSON.parse(fs.readFileSync(`./files/warns/${idObj.filename}`))
            for (let index = 0; index < file.length; index++) {
                if (file[index].warnid == id) {
                    file[index] = idObj.obj
                    fs.writeFileSync(`./files/warns/${idObj.filename}`, JSON.stringify(file))
                }
            }
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}