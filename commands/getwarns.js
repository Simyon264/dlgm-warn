const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const { time } = require('@discordjs/builders');

module.exports = {
    name: 'getwarns',
    description: "Zeigt dir die Warns von einer der bestimmten Person an.",
    category: 'warns',
    modcommand: true,
    usage: "getwarns <id> [newest|oldest|onlyvalid|badonly]",
    perms: '',
    alias: ["gws"],
    cooldown: 1,
    run: async function (message, prefix, args) {
        if (!(args.length >= 2)) return message.reply("Bitte gebe den Befehl richtig ein.")
        if (message.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const steamID = args[1].split("@")[0].replace(" ", "")
            let sortby = "date"
            if (args[2]) {
                let validArr = ["newest","oldest","onlyvalid","badonly"]
                if (validArr.some(v => args[2].includes(v))) {
                    sortby = args[2]
                } else return message.reply("Bitte wähle einen von den 4 optionen (`Newest, Oldest, Onlyvalid und Badonly`) für die sortierung.") 
            }

            if (steamID.length == 17 || steamID.length == 18) {

                //          Nach datum sortieren =      date // newest first
                //          Älteste zuerst =            oldest
                //          Nur nicht abgelaufenende =  onlyvalid
                //          Nur abgelaufenede =         badonly

                const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
                const warns = f.getWarns(steamID)

                if (warns == "1") return message.reply(f.localization("slashcommands", "getwarns", "nowarns"))

                let points = 0
                let totalPoints = 0
                let items = []
                let page = 1

                // console.log(sortby)

                for (let index = 0; index < warns.length; index++) {
                    // console.log(warns[index]["createdAt"])
                    if (warns[index]["createdAt"] < timestamp) {
                        totalPoints = totalPoints + parseFloat(warns[index]["punkte"].toString().replace(",", "."))
                        if (sortby == "validonly") continue;
                        warns[index].expired = true
                        items.push(warns[index])
                    } else {
                        points = points + parseFloat(warns[index]["punkte"].toString().replace(",", "."))
                        totalPoints = totalPoints + parseFloat(warns[index]["punkte"].toString().replace(",", "."))
                        if (sortby == "badonly") continue;
                        warns[index].expired = false
                        items.push(warns[index])
                    }
                }
                if (sortby == "date") items = items.reverse()

                if (items.length == 0 && sortby != "date") return message.reply("Keine Ergebnisse unter den aktuellen Filtern gefunden.")

                const maxItemsForPage = 5
                const maxpages = Math.ceil(items.length / maxItemsForPage)

                const newMessage = await message.reply("Bitte warten...")

                async function update() {
                    const embed = new discord.MessageEmbed()
                        .setColor(0x00AE86)
                        .setTitle(f.localization("slashcommands", "getwarns", "title", [items[0]["name"].replace(" ", "")]))
                        .setFooter(f.localization("slashcommands", "getwarns", "page", [page, maxpages]))
                        .addField(f.localization("slashcommands", "getwarns", "pointsN"), `${totalPoints}`, true)
                        .addField(f.localization("slashcommands", "getwarns", "pointsT"), `${points}`, true)

                    let itemsCount = 0
                    let count = maxItemsForPage * (page - 1)
                    for (let i = 0; i < items.length; i++) {
                        if (itemsCount !== maxItemsForPage) {
                            if (count < i || count == i) {
                                // console.log(items[i])
                                let utcSeconds = items[i].createdAt
                                let date = new Date(0)
                                date.setUTCSeconds(utcSeconds / 1000)
                                let expiredMsg = ""
                                let extraMsg = ""
                                let type = ""
                                
                                if (items[i].type == "steam") type = "@steam"
                                if (items[i].type == "discord") type = "@discord"
                                
                                if (items[i].extra) extraMsg = f.localization("slashcommands", "getwarns", "extra", [items[i].extra.toString().trim()])
                                if (items[i].expired) expiredMsg = f.localization("slashcommands", "getwarns", "expired")

                                embed.addField(f.localization("slashcommands", "getwarns", "fieldTitle", [time(date, "R")]), f.localization("slashcommands", "getwarns", "fieldBody", [expiredMsg, items[i]["grund"], items[i]["punkte"].toString().replaceAll(",", "."), items[i].by, items[i].byName, items[i].id, extraMsg, type]))
                                itemsCount++
                            }
                        } else {
                            i = items.length
                        }
                    }

                    newMessage.edit({
                        content: "** **",
                        embeds: [embed],
                        components: [generateButtons()]
                    })
                }

                const button1 = new discord.MessageButton()
                    .setStyle("PRIMARY")
                    .setCustomId("left")
                    .setEmoji("◀️")
                const button2 = new discord.MessageButton()
                    .setStyle("DANGER")
                    .setCustomId("delete")
                    .setEmoji("🗑")
                const button3 = new discord.MessageButton()
                    .setStyle("PRIMARY")
                    .setCustomId("right")
                    .setEmoji("▶️")
                const button4 = new discord.MessageButton()
                    .setStyle("SECONDARY")
                    .setCustomId("custom")
                    .setLabel("...")

                function generateButtons() {
                    const row = new discord.MessageActionRow()
                    row.addComponents(button1)
                    row.addComponents(button2)
                    row.addComponents(button4)
                    row.addComponents(button3)
                    return (row)
                }

                let deleted = false

                update()

                const collector = newMessage.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    time: 600000
                });

                collector.on('collect', async i => {
                    if (i.user.id === message.author.id) {
                        i.deferUpdate()
                        switch (i.customId) {
                            case "right":
                                if (page + 1 == maxpages + 1) return
                                page++
                                update()
                                break;
                            case "left":
                                if (page - 1 == 0) return
                                page--
                                update()
                                break;
                            case "delete":
                                deleted = true
                                newMessage.delete()
                                break;
                            case "custom":
                                const customMessage = await message.channel.send(f.localization("slashcommands", "getwarns", "newsite", [i.user.id]))
                                button4.setDisabled(true)
                                newMessage.edit({
                                    components: [generateButtons()]
                                })
                                const filter = m => m.author.id == i.user.id
                                const customCollecter = message.channel.createMessageCollector({
                                    filter,
                                    time: 15000
                                });
                                customCollecter.on("collect", async i => {
                                    let newPage = parseInt(i.content)
                                    if (newPage) {
                                        if (newPage < 1) newPage = 1
                                        if (newPage > maxpages) newPage = maxpages
                                        page = newPage
                                        customCollecter.stop()
                                        await i.delete()
                                        update()
                                    } else return delMsg(await i.channel.send(f.localization("slashcommands", "getwarns", "numberplease", [i.author.id])), 5000)
                                })
                                customCollecter.on("end", async c => {
                                    await customMessage.delete()
                                    button4.setDisabled(false)
                                    interaction.editReply({
                                        components: [generateButtons()]
                                    })
                                })
                                break;
                        }
                    } else {
                        i.deferUpdate()
                        delMsg(await i.channel.send(f.localization("slashcommands", "getwarns", "nobuttons", [i.user.id])), 3000)
                    }
                });

                collector.on('end', collected => {
                    if (deleted) return;
                    newMessage.edit({
                        components: []
                    })
                });

                async function delMsg(message, time) {
                    await f.sleep(time)
                    message.delete()
                }
            } else return message.reply(f.localization("slashcommands", "getwarns", "invalidsteamid"))
        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}