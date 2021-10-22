const f = require('../functions.js');
const Discord = require('discord.js');
const fs = require("fs")
const {
    time
} = require('@discordjs/builders');


module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const name = interaction.options.get('name').value
            
            interaction.editReply(f.localization("slashcommands", "searchbyname", "wait"))

            const dir = fs.readdirSync("./files/warns/")

            const embed = new Discord.MessageEmbed()
                .setTitle(`Verwarnungen für \`${name}\``)
                .setColor(0x00AE86)
                // .setDescription("")

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

            if (finds.length == 0) return interaction.editReply(`Keine Verwarnungen unter \`${name}\` gefunden.`)

            // console.log("deez nutzt")
            interaction.editReply({
                content: "** **",
                embeds: [embed]
                // components: [generateButtons()]
            })

        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}