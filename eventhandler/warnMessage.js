// Imports
const fs = require("fs"); //File system
const colors = require("colours") // Colors in the console
const f = require("../functions.js"); // General functions
const Discord = require("discord.js");
const { time } = require('@discordjs/builders');

module.exports = {
    run: function (client) {
        client.on('messageCreate', async (message) => {
            if (!message.guild) return; // Check if a message is a guild, and ignores it
            if (message.author.bot) return; // Check if message is from a bot, and ignores it

            if (message.channel.id != f.config().bot.warnchannelID) return; // Check if message is in warn channel.

            const args = message.content.split("\n")


            const valid = f.config().bot.validWarn
            const optional = f.config().bot.optionalWarn

            const validSteamIDs = ["steam id", "id", "discord id", "steamid", "discordid", "steam64id","steam","discord"]

            let warnConent = {}
            for (let index = 0; index < args.length; index++) {
                let current = args[index].split(':')
                if (valid.includes(current[0].toLowerCase())) {
                    warnConent[current[0].toLowerCase()] = current[1]
                } else if (optional.includes(current[0].toLowerCase())) {
                    warnConent[current[0].toLowerCase()] = current[1]    
                } else if (validSteamIDs.includes(current[0].toLowerCase())) {
                    warnConent["id"] = current[1]
                }
            }
            warnConent.createdAt = message.createdTimestamp
            warnConent.by = message.author.id
            warnConent.byName = message.author.username
            warnConent.warnid = parseInt(fs.readFileSync("./files/warns/id.txt", "utf-8")) + 1
            warnConent.type = ""
            
            if (warnConent["punkte"]) warnConent["punkte"] = Math.round(parseFloat(warnConent["punkte"].toString().replace(",",".")) * 10) / 10



            let validWarn = true
            let hasValid = false
            for(const str of valid){
                if(Object.keys(warnConent).includes(str)){
                    hasValid = true
                    continue;
                }else{
                    validWarn = false
                }
            }

            let steamID = "0"

            if (warnConent["id"]) steamID = warnConent['id'].replace(" ","").split("@")[0]
            
            warnConent.id = steamID

            if (!hasValid) return

            warnConent.name = warnConent.name.trim()            


            if (steamID.length == 17 || steamID.length == 18) {
                if (steamID.length == 17) warnConent.type = "steam"
                if (steamID.length == 18) warnConent.type = "discord"

                if (!validWarn) return message.reply(f.localization("eventhandlers","warnMessage","notvalid"))


                // Check if person has any warns, if yes post them.
                let lastWarn = await f.getWarns(steamID);
                lastWarn = lastWarn.reverse();
                
                for (let index = 0; index < lastWarn.length; index++) {
                    if (lastWarn[index].extra) {
                        if (lastWarn.extra.contains("HIDDEN")) {
                            lastWarn.splice(index,1)
                        }
                    }
                }

                let hasEmbed = false;
                const embed = new Discord.MessageEmbed()
                    .setColor(0x00AE86)
                if (lastWarn.length !== 0) {
                    hasEmbed = true;
                    const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
                    let totalPoints = 0
                    let points = 0
                    for (let index = 0; index < lastWarn.length; index++) {
                        if (lastWarn[index]["createdAt"] < timestamp) {
                            totalPoints = totalPoints + parseFloat(lastWarn[index]["punkte"].toString().replace(",", "."))
                        } else {
                            points = points + parseFloat(lastWarn[index]["punkte"].toString().replace(",", "."))
                            totalPoints = totalPoints + parseFloat(lastWarn[index]["punkte"].toString().replace(",", "."))
                        }
                    }

                    embed.setTitle("Letzte Verwarnung.")
                    embed.setDescription(`Alle Punkte: \`${totalPoints}\`\nPunkte: \`${points}\``)
                    let utcSeconds = lastWarn[0].createdAt
                    let date = new Date(0)
                    date.setUTCSeconds(utcSeconds / 1000)
                    let expiredMsg = ""
                    let extraMsg = ""
                    let type = ""
                                
                    if (lastWarn[0].type == "steam") type = "@steam"
                    if (lastWarn[0].type == "discord") type = "@discord"
                                
                    if (lastWarn[0].extra) extraMsg = f.localization("slashcommands", "getwarns", "extra", [lastWarn[0].extra.toString().trim()])
                    if (lastWarn[0].expired) expiredMsg = f.localization("slashcommands", "getwarns", "expired")

                    embed.addField(f.localization("slashcommands", "getwarns", "fieldTitle", [time(date, "R")]), f.localization("slashcommands", "getwarns", "fieldBody", [expiredMsg, lastWarn[0]["grund"], lastWarn[0]["punkte"].toString().replaceAll(",", "."), lastWarn[0].by, lastWarn[0].byName, lastWarn[0].id, extraMsg, type]))
                }

                f.addWarn(steamID, warnConent)
                fs.writeFileSync("./files/warns/id.txt", warnConent.warnid.toString())
                
                const warns = await f.getWarns(steamID)
                if (warns == "1") return message.reply(f.localization("eventhandlers", "warnMessage", "nowarns"))
                

                const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000) // Time but -30 days
                let points = 0
                let totalPoints = 0
                for (let index = 0; index < warns.length; index++) {
                    if (warns[index]["createdAt"] < timestamp) {
                        totalPoints = totalPoints + Math.round(parseFloat(warns[index]["punkte"].toString().replace(",",".")) * 10) / 10
                    } else {
                        points = points + Math.round(parseFloat(warns[index]["punkte"].toString().replace(",",".")) * 10) / 10
                        totalPoints = totalPoints + Math.round(parseFloat(warns[index]["punkte"].toString().replace(",",".")) * 10) / 10
                    }
                }

                let extra = ""

                const warnid = f.localization("eventhandlers","warnMessage","warnid",[warnConent.warnid])

                if (points > 3) extra = f.localization("eventhandlers","warnMessage","extra")

                if (points == 1) return message.reply({ content: f.localization("eventhandlers", "warnMessage", "pointss", [warnConent["name"], points, totalPoints, warnid])})
                message.reply({ content: f.localization("eventhandlers", "warnMessage", "pointsm", [warnConent["name"], points, totalPoints, extra, warnid])})
                if (hasEmbed) {
                    message.channel.send({
                        content: "** **",
                        embeds: [embed]
                    })
                }
            } else return message.reply(f.localization("eventhandlers", "warnMessage", "invalidsteamid"))
        });
    }
}