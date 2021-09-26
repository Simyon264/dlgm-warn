const f = require('../functions.js');
const discord = require('discord.js');
const fs = require('fs')

const colourWarn = f.config().messageColours.warn;

module.exports = {
    name: 'eval',
    description: f.localization("commands","eval","exports").description,
    category: 'owner',
    modcommand: true,
    blockCMD: true,
    usage: f.localization("commands","eval","exports").usage,
    perms: '',
    alias: ["e"],
    cooldown: 1,
    run: function (message, prefix, args, client) {
        if (message.author.id == f.config().special.owner) {
            // I have no idea how this works
            const args = message.content.split(" ").slice(1);
            const clean = text => {
                if (typeof (text) === "string")
                    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else
                    return text;
            }
            message.reply(f.localization("commands","eval","start")).then( (msg) => {
                try {
                    const code = args.join(" ");
                    const start = process.hrtime()
                    let evaled = eval(code);
                    const stop = process.hrtime(start)

                    if (typeof evaled !== "string")
                        evaled = require("util").inspect(evaled);

                    let embed = new discord.MessageEmbed()
                        .addField("`EVAL`", "```xl\n" + clean(evaled) + "\n```")
                        //.setDescription("`" + clean(evaled), { code: "xl" } + " `")
                        .addField("`TIME`", "`" + (((stop[0] * 1e9) + stop[1])) / 1e6 + " ms.`")
                        .setColor(colourWarn)
                    msg.edit({content: "** **", embeds: [embed] })
                        .catch(function () {
                            let embed = new discord.MessageEmbed()
                                .addField("`EVAL`", "```xl\n" + f.localization("commands","eval","fileMsg") + "\n```")
                                .addField("`TIME`", "`" + (((stop[0] * 1e9) + stop[1])) / 1e6 + " ms.`")
                                .setColor(colourWarn)
                            msg.edit({ embeds: [embed] })
                            fs.writeFileSync("./files/cache/evalreturn.txt", clean(evaled))
                            message.channel.send({
                                files: [{
                                    attachment: './files/cache/evalreturn.txt',
                                    name: 'evalreturn.xl'
                                }]
                            }).catch(() => {
                                message.channel.send(f.localization("commands","eval","fileError"))
                            });
                        });
                } catch (err) {
                    let embed = new discord.MessageEmbed()
                        .setTitle("")
                        .setDescription(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
                        .setColor(colourWarn)
                    msg.edit({content: "** **", embeds: [embed] })
                }
            });

        } else message.reply(f.localization("commands","eval","noperms"))
    }
}