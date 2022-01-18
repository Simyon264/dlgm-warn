const path = require('path')
const fs = require("fs")
const f = require("../functions.js")

module.exports = {
    help: "Hohle dir eine Datei vom Bot.",
    permissionLevel: "admin",
    run: function (args) {
        return new Promise((resolve, reject) => {
            const parentDir = path.resolve(__dirname, '..')
            let arr = ""
            if (parentDir.charAt(0) == "/") {
                arr = parentDir.split("/").reverse()
            } else arr = parentDir.split("\\").reverse()
            args.shift()
            args = args.join(" ")
            if (args.includes(arr[0]) || args.startsWith("./") || args.startsWith("../") || f.config().special.allowUnsafeFilepaths) {
                if (!fs.existsSync(args)) return resolve("Datei nicht gefunden.")
                let object = {
                    "type": "file",
                    "path": args,
                    "name": path.basename(args),
                    "message": "Datei gefunden und geuploaded."
                }
                resolve(object)
            } else return resolve("Filepath ist nicht erlaubt.")
        })
    }
}