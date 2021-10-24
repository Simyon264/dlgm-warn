const f = require('../functions.js');
const discord = require('discord.js');
const {
    time
} = require('@discordjs/builders');

module.exports = {
    run: async function(interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const steamID = interaction.options.get('steamid').value.split("@")[0].replace(" ", "")
            let sortby = "date"
            if (interaction.options.get("sortby")) {
                sortby = interaction.options.get("sortby").value
                // console.log(sortby)
            }

            if (steamID.length == 17 || steamID.length == 18) {

                //          Nach datum sortieren =      date // newest first
                //          Älteste zuerst =            oldest
                //          Nur nicht abgelaufenende =  onlyvalid
                //          Nur abgelaufenede =         badonly

                const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
                const warns = f.getWarns(steamID)

                if (warns == "1") return interaction.editReply(f.localization("slashcommands", "getwarns", "nowarns"))

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

                if (items.length == 0 && sortby != "date") return interaction.editReply("Keine Ergebnisse unter den aktuellen Filtern gefunden.")

                const maxItemsForPage = 5
                const maxpages = Math.ceil(items.length / maxItemsForPage)

                function update() {
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

                    interaction.editReply({
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

                const message = await interaction.fetchReply()

                const collector = message.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    time: 600000
                });

                collector.on('collect', async i => {
                    if (i.user.id === interaction.user.id) {
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
                                interaction.deleteReply()
                                break;
                            case "custom":
                                const customMessage = await interaction.channel.send(f.localization("slashcommands", "getwarns", "newsite", [i.user.id]))
                                button4.setDisabled(true)
                                interaction.editReply({
                                    components: [generateButtons()]
                                })
                                const filter = m => m.author.id == i.user.id
                                const customCollecter = interaction.channel.createMessageCollector({
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
                    interaction.editReply({
                        components: []
                    })
                });

                async function delMsg(message, time) {
                    await f.sleep(time)
                    message.delete()
                }
            } else return interaction.editReply(f.localization("slashcommands", "getwarns", "invalidsteamid"))
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}