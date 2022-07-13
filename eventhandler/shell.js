// Imports
const fs = require("fs"); //File system
const f = require("../functions.js"); // General functions
const shell = require("./shell.js")

exports.shellResponse = function (message) {
    let date = Date.now()
    let t = new Date(date)

    return `\`\`\`[${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}.${t.getMilliseconds()}]\n${message}\`\`\``
}

module.exports = {
    run: function (client) {
        client.on('messageCreate', async (message) => {
            if (message.guild) return
            if (message.author.bot) return
            message = await message.fetch()
            let currentPerms = ["user"]
            if (f.config().special.owners.includes(message.author.id)) {
                currentPerms.push("admin")
                currentPerms.push("moderator")
            }
            if (client.guilds.cache.get(f.config().bot.slashcommandServerId).members.cache.get(message.author.id).roles.cache.has(f.config().bot.warnRoleId) && !currentPerms.includes("moderator")) {
                currentPerms.push("moderator")
            }
            if (!f.config().special.enableCmd) return message.channel.send(shell.shellResponse("Shell ist nicht aktiv."))

            const args = message.content.split(" ")

            if (!fs.existsSync(`./shell/${args[0]}.js`)) return message.channel.send(shell.shellResponse(`Unbekannter Befehl.\n${args[0]}`))

            if (args.includes("/?")) return message.channel.send(shell.shellResponse(require(`../shell/${args[0]}.js`).help))

            if (!currentPerms.includes(require(`../shell/${args[0]}.js`).permissionLevel)) return message.channel.send(shell.shellResponse("Keine Berechtigung."))

            const shellReturn = await require(`../shell/${args[0]}.js`).run(args, message).catch((err) => {
                message.channel.send(shell.shellResponse(`Error:\nCode: ${err.name}\nMessage: ${err.message}\nStacktrace:\n${err.stack}`))
                return
            })

            let type = "text"

            if (shellReturn.type) type = shellReturn.type

            switch (type) {
                case "text":
                    message.channel.send(shell.shellResponse(shellReturn))
                    break;
                case "custom":
                    let date = Date.now()
                    let t = new Date(date)

                    message.channel.send(`\`\`\`${shellReturn.custom}\n[${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}.${t.getMilliseconds()}]\n${shellReturn.message}\`\`\``)
                    break;
                case "file":
                    message.channel.send({
                        content: shell.shellResponse(shellReturn.message),
                        files: [{
                            attachment: fs.readFileSync(shellReturn.path),
                            name: shellReturn.name
                        }]
                    }).catch((err) => {
                        message.channel.send(shell.shellResponse(`Error:\nCode: ${err.name}\nMessage: ${err.message}\nStacktrace:\n${err.stack}`))
                    });
                    break;
                default:
                    message.channel.send(`Return-Type ${type} nicht unterstütz.`)
                    break;
            }
        });
    }
}