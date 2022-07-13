const f = require("../functions.js")
const discord = require("discord.js")

module.exports = {
    help: "Gebe Feedback oder Kritik ab!",
    permissionLevel: "moderator",
    run: function (args) {
        return new Promise((resolve, reject) => {
            args.splice(0, 1);
            if (args.length == 0) {
                resolve("Du kannst nicht nichts als Feedback nehmen.")
                return;
            }
            const feedback = args.join(" ")
            const embed = new discord.MessageEmbed()
                .setTimestamp(Date.now())
                .setColor(f.config().messageColours.done)
                .setTitle("Feedback wurde abgegeben")
                .setDescription(feedback)
            client.guilds.cache.get(f.config().bot.slashcommandServerId).channels.cache.get(f.config().bot.feedbackChannelId).send({ embeds: [embed] })
            resolve("Feedback wurde anonym abgegeben.")
        })
    }
}