const functions = require('../functions.js');
const discord = require('discord.js');

var colourInfo = functions.config().messageColours.info;
var colourWarn = functions.config().messageColours.warn;

module.exports = {
    name: 'shutdown',
    description: 'Shuts the bot down.',
    category: 'owner',
    modcommand: true,
    usage: 'shutdown',
    perms: '',
    cooldown: 1,
    alias: ["sd"],
    run: function (message, prefix, args, client) {
        if (f.config().special.owners.includes(message.author.id)) {
            message.reply("Shutting down! :clap:").then(function () {
                console.log("Discord command: Shutdown")
                process.emit('SIGINT')
            });
        } else {
            functions.embed(message, "Fehler", colourWarn, "Du hast nicht genug Rechte um diesen Befehl auszufüren.")
        }
    }
}