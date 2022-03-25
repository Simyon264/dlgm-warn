module.exports = {
    help: "Sehe den Ping von dem Bot.",
    permissionLevel: "user",
    run: function (args, message) {
        return new Promise(async (resolve, reject) => { 
            const msgPing = message.createdTimestamp - Date.now() 

            resolve(`Bot: ${msgPing}\nAPI: ${client.ws.ping}`)
        })
    }
}