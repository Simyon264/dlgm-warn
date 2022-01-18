const f = require('../functions.js');
const discord = require('discord.js');

module.exports = {
    name: 'ping',
    description: f.localization("commands","ping","exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands","ping","exports").usage,
    perms: '',
    alias: ["ut","uptime"],
    cooldown: 5,
    run: function (message, prefix, args, client) {

        // Get the days/hours/everything else
        let days = Math.floor(client.uptime / 86400000);
        let hours = Math.floor(client.uptime / 3600000) % 24;
        let minutes = Math.floor(client.uptime / 60000) % 60;
        let seconds = Math.floor(client.uptime / 1000) % 60;

        // If ping is over 150 set color to red
        let colour
        if (client.ws.ping > 150) {
            colour = 0xff2121
        } else {
            colour = 0x26e08d
        }
        message.reply(f.localization("commands","ping","ping")).then((m) => { // Send pinging message and edit it to the embed
            // Genereate embed
            let embed = new discord.MessageEmbed()
                .setTitle(f.localization("commands","ping","title"))
                .addField(f.localization("commands","ping","field1"), client.ws.ping + f.localization("commands","ping","ms"))
                .addField(f.localization("commands","ping","uptime"), f.localization("commands","ping","uptimemsg",[days,hours,minutes,seconds]))
                .setColor(colour)
            m.edit({content: "** **", embeds: [embed]})
        }).catch((err) => {
            console.log(err)
        });
    }
}