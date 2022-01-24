const f = require('../functions.js');
const discord = require('discord.js');

module.exports = {
    "author": "Simyon",
    "name": "channel_watcher",
    "config": {
        "enabled": false,
        "channel_id": "",
        "watch_channel_id": "",
        "message": "@here, <@person> is waiting in the support queue!"
    },
    module: async function (client, config) {
        if (!config.enabled) return;
        f.log("Channel watcher watching 👀!");
        process.on("cw_ping", async function channel_watcher_ping(args1) {
            const channel = await client.channels.fetch(config.channel_id)
            channel.send(config.message.replace("person", args1))
        })

        client.on("voiceStateUpdate", async (oldState, newState) => {
            if (newState.channelId == config.watch_channel_id) {
                process.emit("cw_ping", newState.id)
            }
        })
    }
}