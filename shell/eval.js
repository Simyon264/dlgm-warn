const f = require("../functions.js")
const fs = require("fs")
const shell = require("../eventhandler/shell.js")
const util = require("util")

module.exports = {
    help: "Exekutiere Code",
    permissionLevel: "admin",
    run: function (args, message) {
        return new Promise((resolve, reject) => {
            args.shift()
            args = args.join(" ")
            const clean = text => {
                if (typeof (text) === "string")
                    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else
                    return text;
            }
            // message.channel.send(shell.shellResponse("Eval gestartet."))
            const start = process.hrtime()
            let evaled
            try {
                evaled = eval(args);
                if (typeof evaled !== "string") evaled = util.inspect(evaled);
                const stop = process.hrtime(start)
                if (evaled.length > 2000) {
                    fs.writeFileSync("./files/cache/evalreturn.txt", clean(evaled))
                    let object = {
                        "type": "file",
                        "path": "./files/cache/evalreturn.txt",
                        "name": "evalreturn.xl",
                        "message": `Time: ${(((stop[0] * 1e9) + stop[1])) / 1e6}ms`
                    }
                    resolve(object)
                } else {
                    let object = {
                        "type": "custom",
                        "custom": "xl",
                        "message": `Time: ${(((stop[0] * 1e9) + stop[1])) / 1e6}ms\n${clean(evaled)}`
                    }
                    resolve(object)
                }
            } catch (error) {
                let object = {
                    "type": "custom",
                    "custom": "xl",
                    "message": "Error: \n" + clean(error)
                }
                resolve(object)
            }
        })
    }
}