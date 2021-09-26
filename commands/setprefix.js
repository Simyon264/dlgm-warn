const functions = require('../functions.js');
const fs = require('fs')

const colourWarn = functions.config().messageColours.warn;
const colourDone = functions.config().messageColours.done;

module.exports = {
    name: 'setprefix',
    description: 'Sets the prefix for the server!',
    category: 'server',
    modcommand: true,
    usage: 'setprefix <new prefix>',
    perms: 'MANAGE_GUILD',
    alias: ["prefix"],
    cooldown: 1,
    run: function (message, prefix, args, client) {
        let file = JSON.parse(fs.readFileSync(`./files/serverConfigs/${message.guild.id}.json`))
        if (args.length !== 2) {
            message.channel.send("Please specify the new prefix!")
        } else {
            let s = "`"
            if (args[1].length > 100) {
                functions.embed(message, "Error", colourWarn, "The new prefix cant be over 100 characters.")
            } else {
                file.prefix = args[1];
                fs.writeFileSync(`./files/serverConfigs/${message.guild.id}.json`, JSON.stringify(file))
                functions.embed(message, "Done!  :clap:", colourDone, `The command prefix on ${s}${message.guild.name}${s} is now ${s}${args[1]}${s}!`)
            }
        }
    }
}