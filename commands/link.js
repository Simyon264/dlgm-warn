const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
	name: 'link',
	description: f.localization("commands","link","exports").description,
	category: 'general',
	modcommand: false,
	usage: f.localization("commands","link","exports").usage,
	perms: '',
	alias: [],
	cooldown: 1,
	run: function (message, prefix, args, client) {
        if (args.length == 2) {
            let found = false;
            for (let index = 0; index < links.length; index++) {
                let element = links[index];
                if (element.code == args[1]) {
                    found = true
                    discordDB.all(`DELETE FROM "main"."links" WHERE "idDiscord" LIKE '%${message.author.id}%' ESCAPE '/'`, (err) => {
                        if (err) {
                            return message.reply("`" + err.message + "`")
                        }
                    })
                    discordDB.exec(`INSERT INTO "main"."links"("idIngame","idDiscord") VALUES ('${element.id}','${message.author.id}')`, (err) => {
                        if (err) {
                            return message.reply("`" + err.message + "`")
                        } else {
                            if (links[element.newLength - 1]) {
                                if (links[element.newLength - 1].code == element.code) {
                                    links.splice(element.newLength -1,1)            
                                }
                            }
                            message.reply("Discord gelinked.")
                        }
                    })
                }
            }
            if (!found) {
                message.reply("Code nicht gefunden.")
            }
        } else {
            message.reply("Bitte gebe ein Code an.")
        }
	}
}