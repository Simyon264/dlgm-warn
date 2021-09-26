const fs = require("fs")
const f = require("../functions.js")
module.exports = {
    run: function (client) {
        try {
            fs.writeFileSync('./files/log/latest.log', '') // On start write the latest.log file to use.

            client.on('error', (error) => { //If the client errors/debug/warns
                f.log(error)
            });
            client.on('debug', (error) => {
                f.log(error)
            });
            client.on('warn', (error) => {
                f.log(error)
            });
        } catch (err) {
            f.error(err, "debug.js", true)
        }
    }
}