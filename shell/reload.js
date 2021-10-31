module.exports = {
    help: "Lade den Bot neu.",
    permissionLevel: "admin",
    run: function (args) {
        return new Promise((resolve, reject) => {
            let filelog = ""
            for (const path in require.cache) {
                if (path.endsWith('.js')) { // only clear *.js, not *.node
                    if (!path.includes('node_modules')) {
                        delete require.cache[path]
                        filelog = filelog + (`File reloaded: ${path}\n`)
                    }
                }
            }
            resolve(filelog)
        })
    }
}