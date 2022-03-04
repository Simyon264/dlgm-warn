const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const { time } = require('@discordjs/builders');

module.exports = {
    name: 'deletewarn',
    description: "Lösche eine Verwarnung vom System.",
    category: 'warns',
    modcommand: true,
    usage: "deletewarn <warn ID>",
    perms: '',
    alias: ["dw"],
    cooldown: 1,
    run: async function(message, prefix, args) {
        if (!(args.length == 2)) return message.reply(f.localization("slashcommands","deletewarn","nowarnid"))
        if (message.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const newMessage = await message.reply(f.localization("slashcommands","deletewarn","wait"))
            const id = parseInt(args[1])

            if (isNaN(id)) return newMessage.edit(f.localization("slashcommands","deletewarn","notvalid"))

            let idObj = {
                found: false,
                obj: {}
            }

            const warn = await f.getWarn(id)

            idObj.obj = warn

            if (typeof warn != "undefined") idObj.found = true;

            if (!idObj.found) return newMessage.edit(f.localization("slashcommands","deletewarn","nowarn",[id]))

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
                .addField(f.localization("slashcommands","deletewarn","field2t"), f.localization("slashcommands","deletewarn","field2",[idObj.obj.id.toString().trim(), type]))
                .addField(f.localization("slashcommands", "deletewarn", "field3t"), f.localization("slashcommands", "deletewarn", "field3", [idObj.obj.grund.toString().trim()]))
                .addField(f.localization("slashcommands", "deletewarn", "field4t"), f.localization("slashcommands", "deletewarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands","deletewarn","field5t"), f.localization("slashcommands","deletewarn","field5",[idObj.obj.by,idObj.obj.byName]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands","deletewarn","field6t"), f.localization("slashcommands","deletewarn","field6",[idObj.obj.extra.toString().trim()]))
            
            newMessage.edit({ content: "** **", embeds: [embed], components: [row]})
            
            const collector = newMessage.createMessageComponentCollector({ componentType: 'BUTTON', time: 600000 });


            let deleted = false
            collector.on('collect', async i => {
                if (i.user.id === message.author.id) {
                    i.deferUpdate()
                    switch (i.customId) {
                        case "yes":
                            db.exec(`DELETE FROM warns WHERE warnid="${id}";`, (err) => {
                                if (err) {
                                    interaction.editReply({
                                        content: `Ein Fehler ist aufgetreten.\n${err.message}\nCOMMAND: DELETE FROM warns WHERE warnid="${id}";`,
                                        embeds: [],
                                        components: []
                                    })
                                    return
                                }
                                deleted = true
                                embed.setTitle(f.localization("slashcommands","deletewarn","deleted"))
                                newMessage.edit({ embeds: [embed], components: [] })
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
                embed.setTitle(f.localization("slashcommands","deletewarn","cancel"))
                newMessage.edit({embeds: [embed], components: [] })
            });

            async function delMsg(message,time) {
                await f.sleep(time)
                message.delete()
            }
        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}