const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    name: 'addwarn',
    description: "Füge eine Verwarnung zu einem Benutzer hinzu.",
    category: 'warns',
    modcommand: true,
    usage: "addwarn <name>;<id>;<grund>;<punkte>[;extra]",
    perms: '',
    alias: ["aw"],
    cooldown: 1,
    run: async function(message, prefix, args) {
        if (!(args.length >= 2)) return message.reply("Bitte gebe einen richtigen Warn an.")
        if (message.member.roles.cache.has(f.config().bot.warnRoleId)) {
            args.splice(0,1)
            const argsJoined = args.join(' ');
            args = argsJoined.split(';');

            const name = args[0]
            const steamID = args[1].split("@")[0].replace(" ", "")
            const grund = args[2]
            const punkte = args[3]
            
            let extra = args[4]
            
            if (extra) extra = extra.trim()

            if (steamID.length == 17 || steamID.length == 18) {
                let warns = {}
                warns.name = name
                warns["id"] = steamID
                warns["grund"] = grund
                warns["punkte"] = punkte
                warns.createdAt = message.createdTimestamp
                warns.by = message.author.id
                warns.byName = message.author.username

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
                embed.setAuthor(warns.byName, message.author.avatarURL({ dynamic: true }))

                f.addWarn(steamID,warns)

                if (message.channel.id == f.config().bot.warnchannelID) {
                    message.reply({
                            embeds: [embed]
                    })
                } else {
                    await message.guild.channels.cache.find(channel => channel.id == f.config().bot.warnchannelID).send({
                            embeds: [embed]
                    });
                    message.reply("Verwarnung wurde vergeben.")
                }
            } else return message.reply(f.localization("slashcommands", "addwarn", "invalidsteamid"))
        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}