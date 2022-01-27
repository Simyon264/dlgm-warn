const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const {
    time
} = require('@discordjs/builders');

module.exports = {
    run: async function(interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const name = interaction.options.get('name').value.trim()

            interaction.editReply(f.localization("slashcommands", "searchbyname", "wait"))

            let page = 1

            let file
            let finds = []
            const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
            file = await f.search(name)
            
            file.forEach(element => {
                let hidden = false
                if (element.extra) {
                    if (element.extra.includes("HIDDEN")) hidden = true;
                }
                if (!hidden) {
                    finds.push(element)
                }
            });
            const maxItemsForPage = 5
            const maxpages = Math.ceil(file.length / maxItemsForPage)

            if (finds.length == 0) return interaction.editReply(`Keine Verwarnungen unter \`${name}\` gefunden.`)

            function update() {
                const embed = new discord.MessageEmbed()
                    .setTitle(`Verwarnungen für \`${name}\``)
                    .setColor(0x00AE86)
                    .setFooter(f.localization("slashcommands", "getwarns", "page", [page, maxpages]))
                
                let itemsCount = 0
                let count = maxItemsForPage * (page - 1)
                for (let i = 0; i < finds.length; i++) {
                    if (itemsCount !== maxItemsForPage) {
                        if (count < i || count == i) {
                            let utcSeconds = finds[i].createdAt
                            let date = new Date(0)
                            date.setUTCSeconds(utcSeconds / 1000)
                            let type = ""

                            let expired = ""

                            if (finds[i].type == "steam") type = "@steam"
                            if (finds[i].type == "discord") type = "@discord"

                            if (finds[i].createdAt < timestamp) expired = "__**Diese Verwarnung ist abgelaufen**__\n"

                            let extra = ""
                            if (finds[i].extra) extra = `Extra: *${finds[i].extra.trim()}*\n`

                            let newName = f.replaceAllCaseInsensitve(name, `**${name}**`,finds[i].name)

                            embed.addField(`Verwarnung ${time(date, "R")}`, `${expired.trim()}\nName: *${newName.trim()}*\nID: *${finds[i].id.toString().trim()}${type}*\nGrund: *${finds[i].grund.trim()}*\n${extra}Warn ID: *${finds[i].warnid}*\nPunkte: *${finds[i].punkte}*`)
                            itemsCount++
                        }
                    } else {
                        i = finds.length
                    }
                }
                interaction.editReply({
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

            const message = await interaction.fetchReply()

            const collector = message.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 600000
            });

            // interaction.editReply({
            //     content: "** **",
            //     embeds: [embed],
            //     components: [generateButtons()]
            // })

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

        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}