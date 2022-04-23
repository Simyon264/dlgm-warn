const functions = require('../functions.js');
const fs = require('fs')

module.exports = {
    name: 'unblock',
    description: 'Unblock someone',
    category: 'moderation',
    modcommand: true,
    blockCMD: true,
    usage: 'unblock <user> <admin block(true,false)>',
    perms: 'MANAGE_GUILD',
    alias: [],
    cooldown: 10,
    run: function (message, prefix, args, client) {
        if (args.lenghts != 2) { // See if user was mentioned
            let user = message.mentions.users.first(); // Get mentioned user
            if (user) { // Check if user was pinged
                let file = JSON.parse(fs.readFileSync(`./files/serverConfigs/${message.guild.id}.json`)) // Get config file
                if (typeof file.blockedUsers !== 'undefined') {
                    let found = false
                    let forindex = 0
                    for (let index = 0; index < file.blockedUsers.length; index++) {
                        if (file.blockedUsers[index].id == user) {
                            found = true
                            forindex = index
                        }
                    }
                    if (found) {
                        if (file.blockedUsers[forindex].adminBlock) {
                            if (message.author.id != functions.config().special.owner) {
                                message.reply("Nutzer i st admin blockiert.")
                                return;
                            }
                        }
                        file.blockedUsers.splice(forindex, 1)
                        fs.writeFileSync(`./files/serverConfigs/${message.guild.id}.json`, JSON.stringify(file))
                        message.channel.send(`<@${user.id}> entblockiert.`)
                    } else message.channel.send("nutzer ist nicht blokciert")
                } else message.channel.send("Nutzer ist nicht blockirt")
            } else message.channel.send("Erwähne die Person die ich entblocken soll.")
        } else message.channel.send("Wen soll ich entblocken")
    }
}