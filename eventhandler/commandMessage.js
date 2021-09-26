// Imports
const fs = require("fs"); //File system
const colors = require("colours") // Colors in the console
const f = require("../functions.js"); // General functions
const Discord = require('discord.js') // Discord.... duh
const path = require('path'); // Used for the errror handler
const cooldowns = new Discord.Collection();

function error_handler(err, type, message) {
    message = (typeof message === 'undefined') ? '' : message; // Defaults to blank in no message parameter is passed
    let error = `${type}\n\n${message}\n\n${err}\n\n${err.stack}` // Get the error and the error stacktrace
    let date = new Date() //The date when the error occured
    let iso_date = date.toISOString() //Gets the iso date
    let log_filename = `${iso_date}_${module.filename.slice(__filename.lastIndexOf(path.sep) + 1, module.filename.length - 3)}`.split(':').join('.') // Generate the file name

    fs.writeFileSync(`./files/log/${log_filename}.txt`, error) // Write the file
    console.log(colors.red(`An error occured! The error can be found in /files/log/${log_filename}.txt`)) // Console log that a error occured
}


// This is for running a CMD
function runCMD(commandFile, guildConfig, message, colourWarn, prefix, args, client) {
    try {
        f.log(`Command execution reqeusted. Command: ${commandFile['name']}`)
        const commandName = commandFile['name']
        const isMod = commandFile['modcommand']
        const comandCooldown = commandFile['cooldown']

        f.log(`Is mod: ${isMod}`)

        if (!cooldowns.has(commandName)) {
            cooldowns.set(commandName, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const cooldownAmount = (comandCooldown || 3) * 1000; // Use comand cooldown, or default to 3 seconds, and then convert it to milliseconds

        f.log('Cooldown check in progress...')
        // Check if user is on the cooldown list
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                f.log('The user is still on cooldown...')
                message.channel.send(`You're using **${commandName}** too quickly. Wait another ${timeLeft.toFixed(1)} seconds to use this command again.`)
                return;
            }
        }
        f.log('Cooldown check passed...')
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        f.log('Block check started...')
        // Check if the user is blocked
        if (guildConfig.blockedUsers) {
            const blockCMD = commandFile['blockCMD']
            const blockedUsers = guildConfig.blockedUsers
            for (let i = 0; i < blockedUsers.length; i++) {
                if (blockedUsers[i].id == message.author.id) {
                    if (!blockCMD) return f.log('Command execution failed, user is blocked.'); // If the command is not suppossed to be executed when a user is blocked, send no repsonse
                }
            }
            f.log('Block check passed...')
        }
        // Check if the member sending the message has appropiate permissions to run a command
        let commandPermissions = commandFile['perms'];
        if (commandPermissions) {
            f.log('Command has a perm check... Checking perms...')

            if (!message.member.permissions.has(commandPermissions)) {
                f.log("User is missing perms")
                f.embed(message, "Error", colourWarn, `You are missing the permission: ${commandPermissions}`);
                return;
            } else f.log('Perm check passed.')
        }

        f.log('Bot channel check')
        if (typeof guildConfig.bot == 'undefined') {
            f.log('Bot channel undefined.')
            commandFile['run'](message, prefix, args, client)
            f.log(`Command executed: ${commandFile['name']}`)
        } else {
            f.log('Bot channel definded, checking for right channel...')
            if (guildConfig.bot != message.channel.id) {
                f.log('Message is not in a bot channel, checking if command is a mod command...')
                if (!isMod) return f.log('Command is a mod command. Execution canceled.');
            } // If the command is requested outside the command channel and is not a moderation command, send no response

            commandFile['run'](message, prefix, args, client)
            f.log(`Command executed: ${commandFile['name']}`)
        }
    } catch (err) {
        f.log("A command error occured")
        f.embed(message, "", colourWarn, "An error occured!");
        error_handler(err, "Command Error!", `Message: ${message.content}`)
    }
}

module.exports = {
    run: function (client) {
        client.on('messageCreate', async (message) => {
            try {
                f.log(`Message recieved: ${message}`)
                if (!message.guild) return f.log("Message is in a DM channel..."); // Check if a message is a guild, and ignores it
                if (message.author.bot) return f.log("Message author is a bot...") // Check if message is from a bot, and ignores it

                // Defining general vars used
                const colourWarn = f.config().messageColours.warn;
                const guildConfig = f.getServerConfig(message.guild.id)
                let prefix = guildConfig.prefix;
                const content = message.content;
                const args = content.substring(prefix.length).split(" ");

                f.log(`Checking for prefix...`)
                // Check if message starts with the prefix
                if (content.substring(0, prefix.length).toLowerCase() == prefix.toLowerCase()) {
                    // Getting the command file from args[0]
                    f.log(`File check started... Looking for file ${args[0]}.js`)

                    fs.stat(`./commands/${args[0]}.js`, function (err, stat) {
                        // Look for the command file using the name of the command
                        if (!err) {
                            f.log(`File check done! Command found!`)
                            const cmdFile = require(`../commands/${args[0]}.js`)
                            runCMD(cmdFile, guildConfig, message, colourWarn, prefix, args, client)

                        } else if (err.code === 'ENOENT') { // If the command couldn't be found by it's name, use aliases
                            f.log(`File check done! Command not found... Starting alias check...`)
                            f.log(`Reading the command dir...`)

                            const dir = fs.readdirSync("./commands/") //Reading through the command dir
                            f.log(`Done!`)

                            let commandFile
                            let found = false

                            f.log("Searching for aliases...")
                            for (let i = 0; i < dir.length; i++) {
                                commandFile = require(`../commands/${dir[i]}`);
                                if (commandFile['alias'].includes(args[0].toLowerCase())) {
                                    found = true;
                                    final = i
                                    i = dir.length;
                                    f.log(`Alias found!`)
                                }
                            }
                            if (found) {
                                f.log(`Executing command by alias...`)

                                const cmdFile = require(`../commands/${dir[final]}`)
                                runCMD(cmdFile, guildConfig, message, colourWarn, prefix, args, client)
                            } else f.log(`The command ${args[0]} requested by ${message.author.username} could not be found.`)
                        } else {
                            error_handler(err, "Unexpected Error!")
                            f.embed(message, "", colourWarn, "An unexpected error has occured. Please contact the bot owner (Simyon#6969)");
                        }
                    });
                } else f.log('Prefix check failed...');
            } catch (error) {
                error_handler(err, "Unexpected Error!")
            }
        });
    }
}