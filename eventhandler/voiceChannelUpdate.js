const fs = require("fs")
const f = require("../functions.js")
module.exports = {
    run: function (client) {
        try {
            client.on('voiceStateUpdate', (oldState, newState) => {
                let serverQueue = queue.get(oldState.guild.id)
                if (!serverQueue) return;
                if (!oldState.channel) return
                if (serverQueue.voiceChannel.id == oldState.channel.id) {
                    if (newState.channel) return;
                    if (serverQueue.voiceChannel.members.filter(x => x.user.bot == false).size == 0) {
                        f.stop(oldState.guild)
                        serverQueue.textChannel.send("Ich habe den Sprachkanal verlassen, weil keiner mehr im Sprachkanal war.")
                    }
                }
            });
        } catch (err) {
            f.error(err, "voiceChannelUpdate.js", true)
        }
    }
}