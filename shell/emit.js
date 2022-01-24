const f = require('../functions')

module.exports = {
    help: "Process Emit. Usage: emit <trigger name>\n/? - Zeige die Hilfe an.",
    permissionLevel: "admin",
    run: function (args) {
        return new Promise((resolve, reject) => {
            if (args.length < 2) resolve("Bitte gebe ein emit wert an.")
            f.log(`EMIT: ${args[1]}`)
            const emited = process.emit(args[1])
            if (!emited) resolve(`Keine Antwort auf "${args[1]}"`);
            const listeners = process.listeners(args[1])
            
            let cache = ""
            if (listeners.length == 1) { cache = "Eine Antwort.\n" } else cache = `${listeners.length} Antworten.\n`
            
            for (let index = 0; index < listeners.length; index++) {
                cache = cache + `${index + 1} - ${listeners[index].name}\n`
            }
            resolve(cache)
        })
    }
}