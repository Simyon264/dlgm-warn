const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const mathjs = require('mathjs')
const table = require('table');
const {
    fork
} = require('child_process');

process.on('message', (args) => {
    try {
        const expression = args;
        const expr = mathjs.compile(expression);

        const xValues = mathjs.range(-50, 50.5, 0.5);
        const yValues = xValues.map(function (x) {
            return expr.evaluate({
                x: x
            })
        })

        let data = [
            ["X-Wert", "Y-Wert"]
        ]
        for (let index = 0; index < xValues.size(); index++) {
            data.push([xValues.toArray()[index].toString(), yValues.toArray()[index].toString()])
        }

        process.send(JSON.stringify(data));
    } catch (error) {
        process.send(`\`${error.message}\``)
    }
});

module.exports = {
    name: 'table',
    description: f.localization("commands", "table", "exports").description,
    category: 'general',
    modcommand: false,
    usage: f.localization("commands", "table", "exports").usage,
    perms: '',
    alias: [],
    cooldown: 5,
    run: async function (message, prefix, args, client) {
        if (args.length == 1) return message.reply("Bitte gebe eine Funktion an.")
        args.splice(0, 1)
        args = args.join(" ")
        const compute = fork('./commands/table.js');

        compute.send(args)
        compute.on('message', result => {
            compute.kill()
            let data = JSON.parse(result)
            let reply = "```xl\n"
            const config = {
                drawHorizontalLine: (lineIndex, rowCount) => {
                    return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount;
                }
            }
            const tableString = table.table(data, config)
            reply += tableString
            reply += "```"
            if (reply.length > 2000) {
                fs.writeFileSync("./files/cache/mathreturn.txt", tableString);
                try {
                    message.reply({
                        files: [{
                            attachment: './files/cache/mathreturn.txt',
                            name: 'mathreturn.xl'
                        }]
                    })
                    return;
                } catch (error) {
                    return message.reply("Antwort war zu lang.")
                }
            }
            message.reply(reply)
        });
    }
}