const f = require('../functions.js');
const discord = require('discord.js');
const fs = require('fs')

module.exports = {
    name: 'reload',
    description: f.localization("commands","reload","exports").description,
    category: 'owner',
    modcommand: true,
    blockCMD: true,
    usage: f.localization("commands","reload","exports").usage,
    perms: '',
    alias: [],
    cooldown: 1,
    run: async function (message, prefix, args, client) {
        if (message.author.id == f.config().special.owner) {
            console.log('Registering Commands...')
            const data = JSON.parse(fs.readFileSync("./files/important files/slashcommands.json"))
            const command = await client.guilds.cache.get(f.config().bot.slashcommandServerId).commands.set(data);
            message.reply(f.localization("commands","reload","clear")).then((msg) => {
                let filelog = ""
                for (const path in require.cache) {
                    if (path.endsWith('.js')) { // only clear *.js, not *.node
                        if (!path.includes('node_modules')) {
                            delete require.cache[path]
                            filelog = filelog + (`File reloaded: ${path}\n`)
                        }
                    }
                }
                filelog = filelog + `\n\n${JSON.stringify(command).replaceAll(",","\n")}`
                msg.edit(f.localization("commands","reload","done"))
                fs.writeFileSync("./files/cache/reloadlog.txt", filelog.toString())
                message.channel.send({
                    files: [{
                        attachment: './files/cache/reloadlog.txt',
                        name: 'reloadlog.yml'
                    }]
                })
            })
        } else message.reply(f.localization("commands","reload","noperms"))
    }
}