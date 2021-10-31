const path = require('path')
const fs = require("fs")
const f = require("../functions.js")

module.exports = {
    help: "Hohle dir ein DIR vom Bot.",
    permissionLevel: "admin",
    run: function (args) {
        return new Promise((resolve, reject) => {
            const clean = text => {
                if (typeof (text) === "string")
                    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else
                    return text;
            }
            const parentDir = path.resolve(__dirname, '..')
            let arr = ""
            if (parentDir.charAt(0) == "/") {
                arr = parentDir.split("/").reverse()
            } else arr = parentDir.split("\\").reverse()
            args.shift()
            args = args.join(" ")
            if (args.includes(arr[0]) || args.startsWith("./") || args.startsWith("../") || f.config().special.allowUnsafeFilepaths) {
                if (!fs.existsSync(args)) return resolve("DIR nicht gefunden.")
                let object = {
                    "type": "custom",
                    "custom": "xl",
                    "message": clean(require("util").inspect(fs.readdirSync(args)))
                }
                resolve(object)
            } else return resolve("Filepath ist nicht erlaubt.")
        })
    }
}