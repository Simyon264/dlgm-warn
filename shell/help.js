const f = require('../functions')
const fs = require('fs');
const path = require('path');

module.exports = {
    help: "Hilfe.",
    permissionLevel: "user",
    run: function (args) {
        return new Promise((resolve, reject) => {
            const dir = fs.readdirSync("./shell");
            let help = "Hifle:\n";
            dir.forEach(element => {
                let curElement = require(`../shell/${element}`)
                help += `${path.basename(element)} - ${curElement.help} - Permission level: ${curElement.permissionLevel}\n\n`
            });
            resolve(help);
        })
    }
}