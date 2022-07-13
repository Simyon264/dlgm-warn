const f = require('../functions.js');
const discord = require('discord.js');
const colors = require('colours')

const colourInfo = f.config().messageColours.info;
const colourWarn = f.config().messageColours.warn;

module.exports = {
    name: 'restart',
    description: 'Restarts the bot.',
    category: 'owner',
    modcommand: true,
    usage: 'shutdown',
    perms: '',
    cooldown: 1,
    alias: ["rs"],
    run: function (message, prefix, args, client) {
        if (f.config().special.owners.includes(message.author.id)) {
            message.reply("Restarting! :clap:").then(function () {
                console.log(colors.red("Discord command: Restart"))
                console.log(colors.red('Destroying client...'))
                f.log('Exiting...')
                console.log('Closing the warn database connection.');
                db.close((err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                });
                console.log('Closing discord database connection.');
                discordDB.close((err) => {
                    if (err) {
                        return console.error(err.message)
                    }
                })
                client.destroy()
                doTick()
                process.send("RESTART")
            });
        } else {
            f.embed(message, "Fehler", colourWarn, "Du hast nicht genug Rechte um diesen Befehl auszufüren.")
        }
    }
}