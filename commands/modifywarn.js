const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const { time } = require('@discordjs/builders');

module.exports = {
    name: 'modifywarn',
    description: "Modifiziere eine Verwarnung.",
    category: 'warns',
    modcommand: true,
    usage: "modifywarn <warn ID> <grund|name|punkte|extra> <neuer wert>",
    perms: '',
    alias: ["mw"],
    cooldown: 1,
    run: async function(message, prefix, args) {
        if (!(args.length >= 4)) return message.reply("Bitte gebe den Befehl richtig ein.")
        if (message.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const id = parseInt(args[1])
            const change = args[2].toLowerCase()
            args.splice(0,3)
            const newVaule = args.join(" ")

            if (isNaN(id)) return message.reply("Bitte gebe eine WarnID an.")

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
            if (!idObj.found) return message.reply(f.localization("slashcommands", "getwarn", "notfound", [id]))

            const oldName = idObj.obj.name
            let old = idObj.obj[change]
            if (typeof old == "undefined") old = "Nichts"

            switch (change) {
                case "punkte":
                    const newNumber = Math.round(parseFloat(newVaule.toString().replace(",", ".")) * 10) / 10
                    if (isNaN(newNumber)) return message.reply("Bitte gebe eine Nummer ein.")
                    idObj.obj["punkte"] = newNumber
                    break;
                default:
                    let validArr = ["punkte","grund","extra","name"]
                    if (validArr.some(v => change.includes(v))) {
                        idObj.obj[change] = newVaule
                    } else return message.reply("Bitte wähle einen von den 4 optionen (`Punkte, Grund, Name und extra`) für den Wert der geändert werden soll.") 
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
                .addField("Punkte:",`*${idObj.obj.punkte.toString()}*`)
                .addField(f.localization("slashcommands","getwarn","field2t"), f.localization("slashcommands","getwarn","field2",[idObj.obj.id.trim(), type]))
                .addField(f.localization("slashcommands","getwarn","field3t"), f.localization("slashcommands","getwarn","field3",[idObj.obj.grund.toString().trim()]))
            if (idObj.obj.extra) embed.addField(f.localization("slashcommands","getwarn","field6t"), f.localization("slashcommands","getwarn","field6",[idObj.obj.extra.toString().trim()]))
                .addField(f.localization("slashcommands", "getwarn", "field4t"), f.localization("slashcommands", "getwarn", "field4", [idObj.obj.punkte.toString().trim()]))
                .addField(f.localization("slashcommands","getwarn","field5t"), f.localization("slashcommands","getwarn","field5",[idObj.obj.by,idObj.obj.byName]))

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
            
            const newMessage = await message.reply({ content: "** **", embeds: [embed], components: [row]})
            
            const collector = newMessage.createMessageComponentCollector({ componentType: 'BUTTON', time: 600000 });


            let deleted = false
            collector.on('collect', async i => {
                if (i.user.id === message.author.id) {
                    i.deferUpdate()
                    switch (i.customId) {
                        case "yes":
                            deleted = true
                            file = JSON.parse(fs.readFileSync(`./files/warns/${idObj.filename}`))
                            for (let index = 0; index < file.length; index++) {
                                if (file[index].warnid == id) {
                                    file[index] = idObj.obj
                                    fs.writeFileSync(`./files/warns/${idObj.filename}`, JSON.stringify(file))
                                }
                            }
                            embed.setDescription(`**Verwarnung für \`${oldName.toString().trim()}\`**\n\n\`${old.toString().trim()}\` wurde zu \`${idObj.obj[change].toString().trim()}\`\n\n`)
                            embed.setTitle("Verwarnung geändert!")
                            newMessage.edit({ embeds: [embed], components: [] })
                            collector.stop()
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
                newMessage.edit({embeds: [embed], components: [] })
            });

            async function delMsg(message,time) {
                await f.sleep(time)
                message.delete()
            }
            

        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}