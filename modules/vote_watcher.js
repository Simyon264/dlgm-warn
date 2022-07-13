const f = require('../functions.js');
const discord = require('discord.js');

module.exports = {
    "author": "Simyon",
    "name": "vote_watcher",
    "config": {
        "enabled": true,
        "channel_id": "",
        "reactionPositive": "🟢",
        "reactionNegative": "🔴",
    },
    module: async function (client, config) {
        if (!config.enabled) return;
        f.log("Vote watcher watching 👀!");

        client.on("messageCreate", async (message) => {
            if (message.channel.id == config.channel_id) {
                if (config.reactionNegative && config.reactionPositive) {
                    if (!message.system) {
                        await message.react(config.reactionPositive)
                        await message.react(config.reactionNegative)
                    }
                }
            }
        })
    }
}