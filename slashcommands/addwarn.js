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
                
                const embed = new discord.MessageEmbed()
                        .setColor(0x00AE86)
                        .setTitle("Neue Verwarnung!")
                        .addField("❯ Name", `*${name}*`)
                        .addField("❯ ID", `*${steamID}${type}*`)
                        .addField("❯ Grund", `*${grund}*`)
                        .addField("❯ Punkte", `*${punkte}*`)
                if (extra) embed.addField("❯ Extra", `*${extra}*`);
                embed.addField("❯ Verwarnung von", `<@${warns.by}> (${warns.byName})`)
                embed.setFooter(`WarnID | ${warns.warnid}`)
                embed.setAuthor(warns.byName, interaction.user.avatarURL({ dynamic: true }))

                f.addWarn(steamID,warns)

                if (interaction.channel.id == f.config().bot.warnchannelID) {
                    interaction.editReply({
                            embeds: [embed]
                    })
                } else {
                    await interaction.guild.channels.cache.find(channel => channel.id == f.config().bot.warnchannelID).send({
                            embeds: [embed]
                    });
                    interaction.editReply("Verwarnung wurde vergeben.")
                }
            } else return interaction.editReply(f.localization("slashcommands", "addwarn", "invalidsteamid"))
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}