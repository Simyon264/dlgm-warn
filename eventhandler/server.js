const tcpServer = require('net').createServer();
const f = require("../functions.js")
const colors = require('colours')

module.exports = {
    run: function (client) {
        const ipAddress = '127.0.0.1';
        const port = 6969;
        const keepAliveDuration = 2000
        let sockets = []

        console.log(colors.blue(`Starting server at ${ipAddress}:${port}...`));
        f.log(`Starting server at ${ipAddress}:${port}`)

        tcpServer.listen(port, ipAddress);

        tcpServer.on('listening', () => {
            console.log(colors.blue(`Server successfully started at ${ipAddress}:${port}.`))
            f.log(`[NET] Server successfully started at ${ipAddress}:${port}.`)
        });

        tcpServer.on('error', error => {
            f.log(`[NET] [ERROR]  ${error === 'EADDRINUSE' ? `${config.address}:${config.port} is already in use!` : `${error}`}`)
            console.log(colors.red(`${error === 'EADDRINUSE' ? `${config.address}:${config.port} is already in use!` : `${error}`}`))
        });

        tcpServer.on('connection', socket => {
            socket.setEncoding('UTF-8');
            socket.setKeepAlive(true, keepAliveDuration);

            sockets.push(socket);

            f.log(`[NET] [INFO] Connection estabilished with ${socket.address().address}:${socket.address().port}.`);

            socket.on('data', async (data) => {
                try {
                    let formattedData = JSON.parse(data)
                    //f.log(`[NET] [DATA]\n${JSON.stringify(formattedData, null, 4)}`)
                    // console.log(formattedData)
                    try {
                        const id = formattedData.id
                        let achievement
                        switch (formattedData.type) {
                            case "giveAchievement":
                                achievement = f.getAchievement(formattedData.data.achievementId)
                                f.log(`[NET] [INFO] Achievement give: ${id} :: ${achievement.name} :: ${achievement.id}`)
                                let succing = await f.addAchievement(id, achievement.id)
                                if (succing) {
                                    f.log("[NET] [INFO] Achievement given.")
                                } else {
                                    f.log("[NET] [INFO] Achievement not given.")
                                }
                                socket.write(JSON.stringify({
                                    "id": id,
                                    "type": "giveAchievementResponse",
                                    "wasGiven": succing,
                                    "acId": achievement.id
                                }))
                                break;
                            case "achievementCheck":
                                f.log(`[NET] [INFO] Achievement fetched: ${formattedData.data.id} :: ${id}`)
                                achievement = f.getAchievement(formattedData.data.id)
                                if (achievement) {
                                    socket.write(JSON.stringify({
                                        "id": id,
                                        "type": "achievement",
                                        "name": achievement.name,
                                        "achievementId": achievement.id,
                                        "description": achievement.description
                                    }))
                                } else {
                                    socket.write(JSON.stringify({
                                        "id": id,
                                        "type": "achievement",
                                        "name": "",
                                        "achievementId": -1,
                                        "description": ""
                                    }))
                                }
                                break;
                            case "updateStat":
                                //f.log(`[NET] [INFO] Update stat: ${id} :: ${formattedData.data.name} :: ${formattedData.data.value}`)
                                let newValue = formattedData.data.value
                                const stat = formattedData.data.name;
                                let stats = await f.getStats(id)
                                const curStat = stats[stat]
                                if (!curStat && !stats) {
                                    socket.write(JSON.stringify({
                                        "id": id,
                                        "type": "error",
                                        "message": "statNotFound"
                                    }))
                                    return;
                                }
                                if (newValue.includes("++")) {
                                    const splitted = newValue.split("++");
                                    const added = splitted[1]
                                    if (added) {
                                        newValue = curStat + parseInt(added)
                                    }
                                }

                                const updateDone = await f.updateStat(id, stat, newValue)

                                if (updateDone) {
                                    socket.write(JSON.stringify({
                                        "id": id,
                                        "type": "statUpdate",
                                        "updated": true
                                    }))
                                } else {
                                    socket.write(JSON.stringify({
                                        "id": id,
                                        "type": "statUpdate",
                                        "updated": false
                                    }))
                                }

                                await f.sleep(1000)

                                // Update all other vars wich rely on other vars
                                stats = await f.getStats(id)
                                let deaths = stats.deaths
                                if (deaths == 0) {
                                    deaths = 1
                                }
                                let calculated = stats.kills / deaths
                                if (calculated)
                                    f.updateStat(id, "killDeathRatio", Math.round((calculated + Number.EPSILON) * 100) / 100)
                                break;
                            case "linkCheck":
                                f.log(`[NET] [INFO] Link checked, id: ${id}`)
                                let found = false
                                links.forEach(element => {
                                    if (element.id == id) {
                                        found = true;
                                    }
                                });
                                socket.write(JSON.stringify({
                                    "id": id,
                                    "type": "linkCheckResponse",
                                    "isFound": found
                                }))
                                break;
                            case "link":
                                f.log(`[NET] [INFO] Link started, code: ${formattedData.data.code}`)
                                if (!formattedData.data.code) {
                                    socket.write(JSON.stringify({
                                        "id": id,
                                        "type": "error",
                                        "message": "noCode"
                                    }))
                                    return;
                                }
                                for (let index = 0; index < links.length; index++) {
                                    if (links[index].code == formattedData.data.code) {
                                        socket.write(JSON.stringify({
                                            "id": id,
                                            "type": "error",
                                            "message": "codeNotNew"
                                        }))
                                        return;
                                    }
                                }

                                links.push({
                                    "id": id,
                                    "newLength": links.length + 1,
                                    "code": formattedData.data.code,
                                })
                                let expireIn = 60

                                socket.write(JSON.stringify({
                                    "id": id,
                                    "type": "linkSuccess",
                                    "expiresIn": expireIn.toString(),
                                    "code": formattedData.data.code
                                }))

                                await f.sleep(expireIn * 1000)

                                for (let index = 0; index < links.length; index++) {
                                    const element = links[index];
                                    if (element.code == formattedData.data.code) {
                                        links.splice(index, 1)
                                    }
                                }
                                break;
                            case "resetStats":
                                f.log(`[NET] [INFO] Reset requested: ${id}`)
                                socket.write(JSON.stringify({
                                    "id": id,
                                    "type": "resetStatsResponse",
                                    "didReset": await f.resetStats(id)
                                }))
                                break;
                            default:
                                socket.write(JSON.stringify({
                                    "id": id,
                                    "type": "error",
                                    "message": "typeUnknown"
                                }))
                                f.log(`[NET] [ERROR] Unkown data type:\n${formattedData}`)
                                break;
                        }
                    } catch (error) {
                        socket.write(JSON.stringify({
                            "id": formattedData.id,
                            "type": "error",
                            "message": "generalError"
                        }))
                        f.log(`[NET] [ERROR] Error using data:\n${error}\n${error.stack}`)
                    }
                } catch (error) {
                    socket.write(JSON.stringify({
                        "type": "error",
                        "message": "invalidData"
                    }))
                    f.log(`[NET] [ERROR] Recived invalid data:\n\n${data}`)
                }
            });

            socket.on('error', error => {
                if (error.message.includes('ECONNRESET')) {
                    f.log('[SOCKET][INFO] Server closed connection.');
                } else {
                    f.log(`[SOCKET][ERROR] Server closed connection: ${error}.`);
                }
            });

            socket.on('close', () => sockets.splice(sockets.indexOf(socket), 1));
        });
    }
}