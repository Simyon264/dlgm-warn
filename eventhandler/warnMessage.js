// Imports
const fs = require("fs"); //File system
const colors = require("colours") // Colors in the console
const f = require("../functions.js"); // General functions

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


            // console.log(warnConent)
            
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
            warnConent.name = warnConent.name.trim()

            if (!hasValid) return //console.log("NOT A WARN")

            

            // console.log(steamID)

            if (steamID.length == 17 || steamID.length == 18) {
                if (steamID.length == 17) warnConent.type = "steam"
                if (steamID.length == 18) warnConent.type = "discord"
                // console.log(validWarn)

                if (!validWarn) return message.reply(f.localization("eventhandlers","warnMessage","notvalid"))
                // console.log("VALID")

                f.addWarn(steamID, warnConent)
                fs.writeFileSync("./files/warns/id.txt", warnConent.warnid.toString())
            
                const warns = f.getWarns(steamID)
                if (warns == "1") return message.reply(f.localization("eventhandlers", "warnMessage", "nowarns"))
            

                const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
                // console.log(timestamp)
                let points = 0
                let totalPoints = 0
                for (let index = 0; index < warns.length; index++) {
                    // console.log(warns[index]["createdAt"])
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

                if (points == 1) return message.reply(f.localization("eventhandlers","warnMessage","pointss",[warnConent["name"],points, totalPoints,warnid]))
                message.reply(f.localization("eventhandlers","warnMessage","pointsm",[warnConent["name"],points, totalPoints, extra,warnid]))
            } else return message.reply(f.localization("eventhandlers", "warnMessage", "invalidsteamid"))
        });
    }
}