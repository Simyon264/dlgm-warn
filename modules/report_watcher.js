const f = require('../functions.js');
const discord = require('discord.js');
const { time } = require('@discordjs/builders');
const fs = require("fs")

module.exports = {
    "author": "Simyon, Redgame_PVP",
    "name": "report_watcher",
    "config": {
        "enabled": true,
        "channel": ""
    },
    module: async function (client, config) {
        f.log("Report watcher watching 👀!");

        client.on("messageCreate", async (msg) => {
            if (msg.channel.id !== config.channel) return;
            if (msg.author.id == client.user.id) return;
            if (msg.embeds.length == 0) return; // No embed
            const id = msg.embeds[0].fields[9].value.split('@')[0].replace("`","")

            let warns = await f.getWarns(id);
            if (warns.length == 0) return;
            warns = warns.reverse()

            let name = warns[0].name
            const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
            
            if (warns[0].name !== msg.embeds[0].fields[8].value.trim()) {
                warnConent = {
                    "id": id,
                    "warnid": parseInt(fs.readFileSync("./files/warns/id.txt", "utf-8")) + 1,
                    "name": msg.embeds[0].fields[8].value.trim(),
                    "grund": "REPORT-NAMEUPDATE",
                    "extra": "HIDDEN",
                    "punkte": 0,
                    "createdAt": msg.createdTimestamp,
                    "by": client.user.id,
                    "byName": client.user.username,
                    "type": ""
                }

                name = warnConent.name

                if (id.length == 17) warnConent.type = "steam"
                if (id.length == 18) warnConent.type = "discord"

                fs.writeFileSync("./files/warns/id.txt", warnConent.warnid.toString())
                await f.addWarn(id, warnConent)
            }

            let points = 0
            let totalPoints = 0
            for (let index = 0; index < warns.length; index++) {
                if (warns[index]["createdAt"] < timestamp) {
                    totalPoints = totalPoints + parseFloat(warns[index]["punkte"].toString().replace(",", "."))
                    warns[index].expired = true
                } else {
                    warns[index].expired = false
                    points = points + parseFloat(warns[index]["punkte"].toString().replace(",", "."))
                    totalPoints = totalPoints + parseFloat(warns[index]["punkte"].toString().replace(",", "."))
                }
            }

            // Having this code (without the for loop) in the other for loop (^^^ that one) somehow breaks the counting part
            // man fuck nodejs -Simyon

            for (let index = 0; index < warns.length; index++) {
                if (warns[index].extra) {
                    if (warns[index].extra.includes("HIDDEN")) {
                        warns.splice(index,1)
                    }
                }
            }
            
            let showing = 0

            if (warns.length > 5) {
                showing = 5
            } else showing = warns.length

            const embed = new discord.MessageEmbed()
                .setTitle(`Verwarnungen für \`${name}\``)
                .addField(f.localization("slashcommands", "getwarns", "pointsN"), `${totalPoints}`, true)
                .addField(f.localization("slashcommands", "getwarns", "pointsT"), `${points}`, true)
                .setFooter(`${showing} von ${warns.length} Verwarnungen`)
                .setColor(0x00AE86)
            for (let i = 0; i < warns.length; i++) {
                if (i < 5) {
                    let utcSeconds = warns[i].createdAt
                    let date = new Date(0)
                    date.setUTCSeconds(utcSeconds / 1000)
                    let expiredMsg = ""
                    let extraMsg = ""
                    let type = ""
                                
                    if (warns[i].type == "steam") type = "@steam"
                    if (warns[i].type == "discord") type = "@discord"
                                
                    if (warns[i].extra) extraMsg = f.localization("slashcommands", "getwarns", "extra", [warns[i].extra.toString().trim()])
                    if (warns[i].expired) expiredMsg = f.localization("slashcommands", "getwarns", "expired")
                    
                    embed.addField(f.localization("slashcommands", "getwarns", "fieldTitle", [time(date, "R")]), f.localization("slashcommands", "getwarns", "fieldBody", [expiredMsg, warns[i]["grund"], warns[i]["punkte"].toString().replaceAll(",", "."), warns[i].by, warns[i].byName, warns[i].id, extraMsg, type]))
                }
            }
            msg.channel.send({content:"** **", embeds:[embed]})
        })
    }
}