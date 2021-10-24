const f = require('../functions.js');
const fs = require('fs');
const Discord = require('discord.js');
const {
    time
} = require('@discordjs/builders');


module.exports = {
    name: 'searchbyname',
    description: "Suche Verwarnungen mit einem Namen.",
    category: 'warns',
    modcommand: true,
    usage: "searchbyname <name>",
    perms: '',
    alias: ["search"],
    cooldown: 1,
    run: async function(message, prefix, args) {
        if (!(args.length >= 2)) return message.reply("Bitte gebe einen Namen ein zum suchen.")
        if (message.member.roles.cache.has(f.config().bot.warnRoleId)) {
            args.splice(0,1)
            args = args.join(" ")

            const name = args

            const newMessage = await message.reply(f.localization("slashcommands", "searchbyname", "wait"))

            const dir = fs.readdirSync("./files/warns/")

            const embed = new Discord.MessageEmbed()
                .setTitle(`Verwarnungen für \`${name}\``)
                .setColor(0x00AE86)

            let file
            let finds = []
            const timestamp = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)

            for (let index = 0; index < dir.length; index++) {
                // console.log("hi")
                if (dir[index] != "id.txt") {
                    file = JSON.parse(fs.readFileSync(`./files/warns/${dir[index]}`))
                    file.forEach(element => {
                        // console.log("hello")
                        if (element.name.toLowerCase().trim() == name.toLowerCase().trim()) {
                            finds.push(element)

                            let utcSeconds = element.createdAt
                            let date = new Date(0)
                            date.setUTCSeconds(utcSeconds / 1000)
                            let type = ""
                        
                            let expired = ""

                            if (element.type == "steam") type = "@steam"
                            if (element.type == "discord") type = "@discord"
                        
                            if (element.createdAt < timestamp) expired = "__**Diese Verwarnung ist abgelaufen**__\n"

                            let extra = ""
                            if (element.extra) extra = `Extra: *${element.extra.trim()}*\n`
                        
                            embed.addField(`Verwarnung ${time(date, "R")}`, `${expired.trim()}ID: *${element.id.trim()}${type}*\nGrund: *${element.grund.trim()}*\n${extra.trim()}`)
                        }
                    });  
                }
            }

            if (finds.length == 0) return newMessage.edit(`Keine Verwarnungen unter \`${name}\` gefunden.`)

            // console.log("deez nutzt")
            newMessage.edit({
                content: "** **",
                embeds: [embed]
                // components: [generateButtons()]
            })
        } else return message.reply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}