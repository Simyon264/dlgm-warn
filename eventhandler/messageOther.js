// Imports
const fs = require("fs"); //File system
const colors = require("colours") // Colors in the console
const f = require("../functions.js"); // General functions

module.exports = {
    run: function (client) {
        client.on('messageCreate', async (message) => {
            if (!message.guild) return; // Check if a message is a guild, and ignores it
            if (message.author.bot) return; // Check if message is from a bot, and ignores it

            //Read the server config file, and if it's missing, create one.
            try {
                f.log(`Reading guild config file for ${message.guild.name} (${message.guild.id})...`)
                JSON.parse(fs.readFileSync(`./files/serverConfigs/${message.guild.id}.json`, "utf-8"))
                f.log(`File ok.`)
            } catch (err) {
                f.log(`Read failed!`)
                console.log(`${colors.red('Error: Guild config file for')} ${colors.yellow(message.guild.name)} ${colors.red('is missing, creating file...')}`)
                // Reading the template file.
                let serverConfigTemplate = fs.readFileSync("./files/serverConfigs/template.json", "utf-8")
                // Writting new config file.
                fs.writeFileSync(`./files/serverConfigs/${message.guild.id}.json`, serverConfigTemplate)
                f.log(`New config file was written!`)
                console.log(`${colors.green('Success: Guild config file for')} ${colors.yellow(message.guild.name)} ${colors.green('was written!')}`)
            }
        });
    }
}