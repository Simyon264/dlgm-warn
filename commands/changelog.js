const discord = require('discord.js');
const fs = require("fs")
const f = require("../functions.js")

module.exports = {
    name: 'changelog',
    description: f.localization("commands","changelog","exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands","changelog","exports").usage,
    perms: '',
    alias: [],
    cooldown: 1,
    run: function (message, prefix, args, client) {
        const colourInfo = f.config().messageColours.info;

        let embed = new discord.MessageEmbed()
            .setTitle(f.localization("commands","changelog","title"))
            .setColor(colourInfo)
            .setDescription(fs.readFileSync("./files/important files/changelog.txt", "utf-8"))
            .setThumbnail(client.user.avatarURL())
        //.addField("Invite", `[Here](${functions.config().bot.invite} 'Click me to invite me!')`)
        message.channel.send({embeds: [embed]});
    }
}