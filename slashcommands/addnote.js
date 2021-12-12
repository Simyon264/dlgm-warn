const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")

module.exports = {
    run: async function (interaction, client) {
        if (interaction.member.roles.cache.has(f.config().bot.warnRoleId)) {
            const note = interaction.options.get('note').value
            const id = interaction.options.get('id').value.split("@")[0].replace(" ", "")

            if (id.length == 17 || id.length == 18) {
                if (note.length > 2000) {
                    return interaction.editReply("Diese Notiz ist zu lang.")
                }
                
            } else return interaction.editReply(f.localization("slashcommands", "addwarn", "invalidsteamid"))
        } else return interaction.editReply(f.localization("slashcommands", "getwarns", "noperms"))
    }
}