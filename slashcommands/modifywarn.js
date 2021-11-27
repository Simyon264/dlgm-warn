const f = require('../functions.js');
const discord = require('discord.js');

module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const id = interaction.options.get('warnid').value
            const change = interaction.options.get("change").value
            const newVaule = interaction.options.get("neuerwert").value

            let idObj = {
                found: false,
                obj: {},
            }
            const warn = await f.getWarn(id)

            idObj.obj = warn
            idObj.obj.id = idObj.obj.id.toString()

            if (typeof warn != "undefined") idObj.found = true;

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
                .setTitle("Verwarnung ändern?")
                .setDescription(`**Verwarnung für \`${oldName.toString().trim()}\`**\n\n\`${old.toString().trim()}\` wird zu \`${idObj.obj[change].toString().trim()}\`\n\n`)
                .setColor(0x00AE86)
                .setFooter(f.localization("slashcommands","getwarn","footer",[idObj.obj.warnid]))
                .addField(f.localization("slashcommands", "getwarn", "field1t"), f.localization("slashcommands", "getwarn", "field1", [idObj.obj.name.trim()]))
                .addField(f.localization("slashcommands","getwarn","field2t"), f.localization("slashcommands","getwarn","field2",[idObj.obj.id.trim(), type]))
                .addField(f.localization("slashcommands","getwarn","field3t"), f.localization("slashcommands","getwarn","field3",[idObj.obj.grund.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field4t"), f.localization("slashcommands", "getwarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands","getwarn","field5t"), f.localization("slashcommands","getwarn","field5",[idObj.obj.by,idObj.obj.byName]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands", "getwarn", "field6t"), f.localization("slashcommands", "getwarn", "field6", [idObj.obj.extra.toString().trim()]))


            const button1 = new discord.MessageButton()
                .setStyle("SUCCESS")
                .setCustomId("yes")
                .setEmoji("✔️")
            const button2 = new discord.MessageButton()
                .setStyle("DANGER")
                .setCustomId("no")
                .setEmoji("✖️")
            const row = new discord.MessageActionRow()
                .addComponents(button1)
                .addComponents(button2)

            const message = await interaction.fetchReply()
            
            interaction.editReply({ content: "** **", embeds: [embed], components: [row]})
            
            const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 600000 });


            let deleted = false
            collector.on('collect', async i => {
                if (i.user.id === interaction.user.id) {
                    i.deferUpdate()
                    switch (i.customId) {
                        case "yes":
                            deleted = true
                            db.run(`UPDATE warns SET ${change} = ? WHERE warnid = ${id}`, newVaule ,(err) => {
                                if (err) {
                                    interaction.editReply({
                                        content: `Ein Fehler ist aufgetreten.\n${err.message}\nCOMMAND: UPDATE warns SET ${change} = "${newVaule}" WHERE warnid = ${id};`,
                                        embeds: [],
                                        components: []
                                    })
                                    return
                                }
                                embed.setDescription(`**Verwarnung für \`${oldName.toString().trim()}\`**\n\n\`${old.toString().trim()}\` wurde zu \`${idObj.obj[change].toString().trim()}\`\n\n`)
                                embed.setTitle("Verwarnung geändert!")
                                interaction.editReply({ embeds: [embed], components: [] })
                                collector.stop()
                            })
                            break;
                        case "no":
                            collector.stop()
                            break;
                    }
	            } else {
                    i.deferUpdate()
                    delMsg(await i.channel.send(f.localization("slashcommands","deletewarn","nobuttons",[i.user.id])), 3000)
	            }
            });

            collector.on('end', collected => {
                if (deleted) return
                embed.setTitle("Verwarnungsänderung abgebrochen.")
                interaction.editReply({embeds: [embed], components: [] })
            });

            async function delMsg(message,time) {
                await f.sleep(time)
                message.delete()
            }
            

        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}