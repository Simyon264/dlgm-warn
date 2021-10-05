const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const name = interaction.options.get('name').value
            const steamID = interaction.options.get('id').value.split("@")[0].replace(" ", "")
            const grund = interaction.options.get('grund').value
            const punkte = interaction.options.get('punkte').value
            
            let extra = interaction.options.get('extra')
            
            if (extra) {
                extra = interaction.options.get('extra').value
            }

            if (steamID.length == 17 || steamID.length == 18) {
                let warns = {}
                warns.name = name
                warns["id"] = steamID
                warns["grund"] = grund
                warns["punkte"] = punkte
                warns.createdAt = interaction.createdTimestamp
                warns.by = interaction.user.id
                warns.byName = interaction.user.username

                let type = ""

                if (steamID.length == 17) {
                    warns.type = "steam"
                    type = "@steam"
                } 
                if (steamID.length == 18) {
                    warns.type = "discord"
                    type = "@discord"
                }

                if (extra) warns.extra = extra

                warns.warnid = parseInt(fs.readFileSync("./files/warns/id.txt", "utf-8")) + 1
                fs.writeFileSync("./files/warns/id.txt", warns.warnid.toString())
            
                f.addWarn(steamID,warns)
            
                let extraMsg = ""
                if (extra) extraMsg = `Extra: ${extra}\n`

                if (interaction.channel.id == f.config().bot.warnchannelID) {
                    interaction.editReply(`Name: ${name}\nID: ${steamID}${type}\nGrund: ${grund}\nPunkte: ${punkte}\n${extraMsg}\nVerwarnung von: <@${warns.by}> (${warns.byName})`)
                } else {
                    await interaction.guild.channels.cache.find(channel => channel.id == f.config().bot.warnchannelID).send(`Name: ${name}\nid: ${steamID}${type}\nGrund: ${grund}\nPunkte: ${punkte}\n${extraMsg}\nVerwarnung von: <@${warns.by}> (${warns.byName})`);
                    interaction.editReply("Verwarnung wurde vergeben.")
                }
            } else return interaction.editReply(f.localization("slashcommands", "addwarn", "invalidsteamid"))
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}