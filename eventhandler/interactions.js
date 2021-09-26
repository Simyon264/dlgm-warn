const f = require("../functions.js")
const discord = require('discord.js');
const fs = require('fs')

module.exports = {
    run: function (client) {
        client.on('interactionCreate', async interaction => {
            if (interaction.isCommand()) {
                fs.stat(`./slashcommands/${interaction.commandName}.js`, async function (err, stat) {
                    if (!err) {
                        const cmd = require(`../slashcommands/${interaction.commandName}.js`)
                        await interaction.deferReply()
                        
                        try {
                            cmd['run'](interaction, client)
                        } catch (error) {
                            interaction.editReply(f.localization("eventhandlers","interactions","err"))
                            console.log(error)
                        }
                    } else {
                        console.log(`Command ${interaction.commandName} has no file.`)
                        interaction.reply({
                            content: f.localization("eventhandlers","interactions","nofile"),
                            ephemeral: true
                        });
                    }
                })
            }
        });
    }
}