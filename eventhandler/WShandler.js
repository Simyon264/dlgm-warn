const discord = require('discord.js');
const f = require('../functions.js')

module.exports = {
    run: function (client) {
        try {
            client.on('ready', async () => {
                client.user.setPresence({
                        activity: {
                            name: 'SCP:SL on Daylight gaming',
                            type: 'PLAYING'
                        },
                    })
                    console.log('Client connected!')
                    console.log(`Authed for user ${client.user.username}`);
            });
            client.on('shardDisconnect', () => {
                f.log('Client disconnected.')
            });
            client.on('shardReconnecting', () => {
                f.log('Client reconnecting...')
            })
        } catch (error) {
            f.error(error, 'WShandler.js', true)
        }

    }
}