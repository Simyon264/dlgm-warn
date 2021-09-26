const f = require('../functions.js');
const fs = require('fs')

module.exports = {
    name: 'language',
    description: f.localization("commands","language","exports").description,
    category: 'Server',
    modcommand: true,
    usage: f.localization("commands","language","exports").usage,
    perms: 'MANAGE_GUILD',
    alias: ["lang"],
    cooldown: 1,
    run: function (message, prefix, args, client) {
        if (args.length == 2) {
            if (fs.existsSync(`./files/strings/${args[1]}_lang.json`)) {
                const localization = JSON.parse(fs.readFileSync(`./files/strings/${args[1]}_lang.json`))
                
                //Change language in config
                const config = JSON.parse(fs.readFileSync("./files/important files/config.json"))
                config.bot.lang = args[1]
                fs.writeFileSync(`./files/important files/config.json`, JSON.stringify(config))

                for (const path in require.cache) {
                    if (path.endsWith('.js')) { // only clear *.js, not *.node
                        if (!path.includes('node_modules')) {
                            delete require.cache[path]
                        }
                    }
                }

                message.reply(f.localization("commands","language","langchanged",[localization.name, localization.localized_name]))
            
            } else {
                message.reply(f.localization("commands","language","nolang",[args[1]]))
            }
        } else {
            message.reply(f.localization("commands","language","noargs"))
        }
    }
}