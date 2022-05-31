const fs = require('fs')
const discord = require('discord.js')
const f = require('./functions.js')
const colors = require('colours')
const path = require("path");
const voice = require('@discordjs/voice');
const ytpl = require('ytpl');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core')

exports.replaceAllCaseInsensitve = function (strReplace, strWith, string) {
    let esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let reg = new RegExp(esc, 'ig');
    return string.replace(reg, strWith);
}

function formatMilliseconds(milliseconds, padStart) {
    function pad(num) {
        return `${num}`.padStart(2, '0');
    }
    let asSeconds = milliseconds / 1000;

    let hours = undefined;
    let minutes = Math.floor(asSeconds / 60);
    let seconds = Math.floor(asSeconds % 60);

    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        minutes %= 60;
    }

    return hours ?
        `${padStart ? pad(hours) : hours}:${pad(minutes)}:${pad(seconds)}` :
        `${padStart ? pad(minutes) : minutes}:${pad(seconds)}`;
}

/**
 * 
 * @param {discord.VoiceChannel} voiceChannel 
 * @param {discord.TextChannel} textChannel 
 * @returns {boolean}
 * Return :: True: Connection was sucsefull - False: There was an error.
 */
exports.connect = async function (voiceChannel, textChannel,) {
    try {
        if (!voiceChannel) return false;
        if (!textChannel) return false;
        if (queue.get(textChannel.guild.id)) return false;
        const queueContruct = {
            textChannel: textChannel,
            voiceChannel: voiceChannel,
            player: null,
            source: null,
            loop: "none",
            volume: 50,
            songs: [],
            skips: 0,
            skipID: [],
            stops: 0,
            stopID: [],
            playing: false,
            paused: false,
        };

        const connection = voice.joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: textChannel.guild.id,
            adapterCreator: textChannel.guild.voiceAdapterCreator,
        })

        queue.set(textChannel.guild.id, queueContruct)
        f.handleConnection(voiceChannel.guild)
        return true;
    } catch (error) {
        f.error(error)
        return false;
    }
}
/**
 *
 * @param {discord.Guild} guild
 */
exports.handleConnection = function (guild) {
    if (!guild) return;
    const connection = voice.getVoiceConnection(guild.id)
    connection.on(voice.VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                entersState(connection, voice.VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, voice.VoiceConnectionStatus.Connecting, 5_000),
            ]);
            // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
            // Seems to be a real disconnect which SHOULDN'T be recovered from
            connection.destroy();
            const serverQueue = queue.get(guild.id)
            serverQueue.textChannel.send("Verbindung wurde getrennt.")
            queue.delete(guild.id);
        }
    });
}
/**
 * 
 * @param {discord.Guild} guild 
 * @param {string} query 
 * @param {discord.Message} message 
 */
exports.addSong = async function (guild, query, message) {
    let serverQueue = queue.get(guild.id)
    const botMsg = await message.reply("Suche... :mag:")
    let song = {}
    try {
        try {
            const playlistID = await ytpl.getPlaylistID(query)
            const playlist = await ytpl(playlistID, {
                limit: 300,
            })
            botMsg.edit("Playlist wird hinzugefügt, dies kann etwas länger dauern. :notes:")
            for (let index = 0; index < playlist.items.length; index++) {
                serverQueue = queue.get(guild.id);
                let curSong = await ytdl.getInfo(playlist.items[index].shortUrl)
                let curSongInfo = {
                    title: curSong.videoDetails.title,
                    url: curSong.videoDetails.video_url,
                    raw: curSong,
                    by: message.author
                }
                serverQueue.songs.push(curSongInfo)
                if (index == 0) {
                    song = curSongInfo
                }
                await f.sleep(50)
            }
            queue.set(guild.id, serverQueue)
            if (!serverQueue.playing) {
                f.play(guild)
                serverQueue.playing = true
                queue.set(guild.id, serverQueue)
                const embed = new discord.MessageEmbed()
                    .setTitle("Spielt gerade:")
                    .setURL(song.url)
                    .setColor(0x00AE86)
                    .setDescription(`**${song.title}**`)
                    .addField('Länge', `\`${formatMilliseconds(song.raw.videoDetails.lengthSeconds * 1000)}\``, true)
                    .addField('Kanal', `[${song.raw.videoDetails.author.name}](${song.raw.videoDetails.author.channel_url})`, true)
                    .setFooter(`Hinzugefügt von: ${song.by.username}`, song.by.avatarURL(true))
                    .setThumbnail(song.raw.videoDetails.thumbnails[song.raw.videoDetails.thumbnails.length - 1].url)
                message.channel.send({ embeds: [embed] })
            }
            botMsg.edit(`${playlist.items.length} Lieder hinzugefügt.`)
            return
        } catch (error) {
            const songInfo = await ytdl.getInfo(query)
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                raw: songInfo,
                by: message.author,
            };
        }
    } catch (error) {
        try {
            const filters1 = await ytsr.getFilters(query)
            const filter1 = filters1.get('Type').get('Video');
            const searchResults = await ytsr(filter1.url, {
                limit: 1,
            });
            const songInfo = await ytdl.getInfo(searchResults.items[0].url);
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                raw: songInfo,
                by: message.author,
            };
        } catch (error) {
            f.error(error)
            botMsg.edit("Lied konnte nicht hinzugefügt werden. Möglicherweise wurde nichts gefunden.")
        }
    }
    const embed = new discord.MessageEmbed()
        .setTitle("Zur Songliste hinzugefügt:")
        .setURL(song.url)
        .setColor(0x00AE86)
        .setDescription(`**${song.title}**`)
        .addField('Länge', `\`${formatMilliseconds(song.raw.videoDetails.lengthSeconds * 1000)}\``, true)
        .addField('Kanal', `[${song.raw.videoDetails.author.name}](${song.raw.videoDetails.author.channel_url})`, true)
        .setFooter(`Hinzugefügt von: ${song.by.username}`, song.by.avatarURL(true))
        .setThumbnail(song.raw.videoDetails.thumbnails[song.raw.videoDetails.thumbnails.length - 1].url)
    serverQueue.songs.push(song)
    if (!serverQueue.playing) {
        embed.setTitle("Spielt gerade:")
        serverQueue.playing = true
        f.play(guild)
    }
    queue.set(guild.id, serverQueue);
    (await botMsg).edit({
        content: '** **',
        embeds: [embed]
    })
}

exports.play = function (guild) {
    let serverQueue = queue.get(guild.id)
    let player = null;
    let connection = voice.getVoiceConnection(guild.id)

    if (serverQueue.voiceChannel.type == "GUILD_STAGE_VOICE") guild.me.voice.setSuppressed(false);

    let songInfo = serverQueue.songs[0];
    let justSet = false
    if (serverQueue.player) {
        player = serverQueue.player
    } else {
        justSet = true;
        player = voice.createAudioPlayer({
            behaviors: {
                noSubscriber: voice.NoSubscriberBehavior.Play,
            }
        });
        serverQueue.player = player
        queue.set(guild.id, serverQueue)
    }

    let stream = ytdl(songInfo.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        dlChunkSize: 0,
        highWaterMark: 1 << 25,
    })

    let source = voice.createAudioResource(stream, {
        inlineVolume: true,
    })
    source.volume.setVolume(serverQueue.volume / 100)
    player.play(source)
    serverQueue.source = source
    connection.subscribe(player)
    queue.set(guild.id, serverQueue)
    if (player && justSet == false) return;
    player.on('stateChange', (oldState, newState) => {
        if (newState.status == 'idle') {
            serverQueue = queue.get(guild.id);
            if (!serverQueue.source) return;
            if (!serverQueue.source.ended) return f.log("Idle, stream still playing");
            if (serverQueue.songs.length != 1 || serverQueue.loop != "none") {
                if (serverQueue.loop == "queue") {
                    serverQueue.songs.push(serverQueue.songs[0])
                    serverQueue.songs.splice(0, 1)
                }
                if (serverQueue.loop == "none") serverQueue.songs.splice(0, 1)
                const url = serverQueue.songs[0].url
                let stream = ytdl(url, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25,
                })
                let source = voice.createAudioResource(stream, {
                    inlineVolume: true
                })
                source.volume?.setVolume(serverQueue.volume / 100)
                serverQueue.source = source;
                songInfo = serverQueue.songs[0]
                serverQueue.player.play(source)
                // Generating the embed
                const embed = new discord.MessageEmbed()
                    .setTitle("Spielt gerade:")
                    .setURL(songInfo.url)
                    .setColor(0x00AE86)
                    .setDescription(`**${songInfo.title}**`)
                    .addField('Kanal', `[${songInfo.raw.videoDetails.author.name}](${songInfo.raw.videoDetails.author.channel_url})`, true)
                    .addField('Länge', `\`${formatMilliseconds(songInfo.raw.videoDetails.lengthSeconds * 1000)}\``, true)
                    .setFooter(`Hinzugefügt von: ${songInfo.by.username}`, songInfo.by.avatarURL(true))
                    .setThumbnail(songInfo.raw.videoDetails.thumbnails[songInfo.raw.videoDetails.thumbnails.length - 1].url)
                serverQueue.textChannel.send({
                    embeds: [embed]
                })
                serverQueue.skips = 0
                serverQueue.skipID = []
                serverQueue.stops = 0
                serverQueue.stopID = []
                queue.set(guild.id, serverQueue)
            } else {
                serverQueue.textChannel.send("Die Songliste ist fertig.")
                serverQueue.playing = false;
                serverQueue.songs = [];
                queue.set(serverQueue.textChannel.guild.id, serverQueue)
            }
        }
    })
}

/**
 * 
 * @param {discord.Guild} guild 
 * @returns {boolean} 
 * Return :: True: Disconnect was sucesful False: There was an error
 */

exports.stop = function (guild) {
    try {
        if (!guild) return false;
        const serverQueue = queue.get(guild.id)
        if (!serverQueue) return false;
        if (serverQueue.player) {
            serverQueue.player.stop()
        }
        voice.getVoiceConnection(guild.id).destroy()
        queue.delete(guild.id)
        return true;
    } catch (error) {
        f.error(error)
        return false;
    }
}

exports.getAchievements = function (id) {
    return new Promise((resolve, reject) => {
        discordDB.serialize(() => {
            discordDB.all(`SELECT "_rowid_",* FROM "main"."ac" WHERE "id" LIKE '%${id}%' ESCAPE '/'`, (err, row) => {
                if (err) {
                    console.error(err)
                    reject()
                    return;
                }
                resolve(row)
            })
        })
    })
}

exports.getStats = async function (id) {
    return new Promise(async (resolve) => {
        discordDB.serialize(() => {
            discordDB.all(`SELECT "_rowid_",* FROM "main"."stats" WHERE "id" LIKE '%${id}%' ESCAPE '\\'`, (err, row) => {
                if (err) {
                    resolve([])
                } else {
                    if (row[0]) {
                        resolve(row[0])
                    } else {
                        resolve([])
                    }
                }
            })
        })
    })
}

exports.addAchievement = async function (id, acId) {
    return new Promise(async (resolve) => {
        let achievements = await f.getAchievements(id)
        if (achievements.length !== 0 && achievements[0].data) {
            if (JSON.parse(achievements[0].data).includes(acId)) {
                resolve(false);
                return;
            }
        }
        if (achievements.length == 0) {
            discordDB.exec(`INSERT INTO "main"."ac"("id","data") VALUES ('${id}','[${acId}]');`, (err) => {
                if (err) {
                    console.log(err.message)
                    resolve(false)
                    return;
                } else resolve(true)
            })
        } else {
            let data = JSON.parse(achievements[0].data)
            data.push(acId)
            discordDB.exec(`UPDATE ac SET 'data' = '${JSON.stringify(data)}' WHERE id = ${id};`, (err) => {
                if (err) {
                    console.log(err.message)
                    resolve(false)
                    return
                } else resolve(true)
            })
        }
    })
}

exports.getAchievement = function (id) {
    let achievments = JSON.parse(fs.readFileSync("./files/important files/achievements.json"))
    let returnValue
    achievments.forEach(element => {
        if (element.id == id) {
            returnValue = element
        }
    });
    return returnValue
}

exports.getLink = function (id) {
    return new Promise((resolve, reject) => {
        discordDB.serialize(() => {
            discordDB.all(`SELECT "_rowid_",* FROM "main"."links" WHERE "idDiscord" LIKE '%${id}%' ESCAPE '/'`, (err, row) => {
                if (err) {
                    console.error(err)
                    reject()
                    return
                }
                resolve(row[0])
            });
        })
    })
}

exports.getWarns = function (id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT \"_rowid_\",* FROM \"main\".\"warns\" WHERE \"id\" LIKE '%${id}%' ESCAPE '/'`, (err, row) => {
                if (err) {
                    console.error(err.message)
                    reject("1")
                    return
                }
                resolve(row)
            })
            f.log(`ALL WARNS REQEUSTED FOR: ${id}`)
        })
    })
}

exports.search = function (search) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT \"_rowid_\",* FROM \"main\".\"warns\" WHERE \"name\" LIKE '%${search}%' ESCAPE '/'`, (err, row) => {
                if (err) {
                    console.error(err.message)
                    reject("1")
                    return
                }
                resolve(row)
            })
            f.log(`SEARCH FOR: \"${search}\"`)
        })
    })
}

exports.getWarn = function (warnid) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT id id,warnid warnid,name name,grund grund,punkte punkte, createdAt createdAt, by by, byName byName, type type, extra extra FROM warns WHERE warnid = ?', [warnid], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                    return
                }
                f.log("GET REQUEST FOR WARNID: " + warnid)
                resolve(row)
            })
        })
    })
}

exports.addWarn = function (steamID, warnConent) {
    return new Promise((resolve, reject) => {
        f.log(`ADDING ID: ${warnConent.warnid}`)
        f.log(`REASON: ${warnConent.grund}`)
        if (warnConent.extra) {
            db.exec(`INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${warnConent.id.toString().replaceAll("'", "''")}',${parseInt(warnConent.warnid)},'${warnConent.name.toString().replaceAll("'", "''")}','${warnConent.grund.toString().replaceAll("'", "''")}',${parseFloat(warnConent.punkte)},${parseInt(warnConent.createdAt)},'${warnConent.by.toString().replaceAll("'", "''")}','${warnConent.byName.toString().replaceAll("'", "''")}','${warnConent.type.toString().replaceAll("'", "''")}','${warnConent.extra.toString().replaceAll("'", "''")}');`, (err) => {
                if (err) {
                    f.log(`SQLERR: ${err.message}\nSQL COMMAND: INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${warnConent.id.toString().replaceAll("'", "''")}',${parseInt(warnConent.warnid)},'${warnConent.name.toString().replaceAll("'", "''")}','${warnConent.grund.toString().replaceAll("'", "''")}',${parseFloat(warnConent.punkte)},${parseInt(warnConent.createdAt)},'${warnConent.by.toString().replaceAll("'", "''")}','${warnConent.byName.toString().replaceAll("'", "''")}','${warnConent.type.toString().replaceAll("'", "''")}','${warnConent.extra.toString().replaceAll("'", "''")}');`)
                    reject(err)
                    return
                }
                resolve()
            })
        } else {
            db.exec(`INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${warnConent.id.toString().replaceAll("'", "''")}',${parseInt(warnConent.warnid)},'${warnConent.name.toString().replaceAll("'", "''")}','${warnConent.grund.toString().replaceAll("'", "''")}',${parseFloat(warnConent.punkte)},${parseInt(warnConent.createdAt)},'${warnConent.by.toString().replaceAll("'", "''")}','${warnConent.byName.toString().replaceAll("'", "''")}','${warnConent.type.toString().replaceAll("'", "''")}',NULL);`, (err) => {
                if (err) {
                    f.log(`SQLERR: ${err.message}\nSQL COMMAND: INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${warnConent.id.toString().replaceAll("'", "''")}',${parseInt(warnConent.warnid)},'${warnConent.name.toString().replaceAll("'", "''")}','${warnConent.grund.toString().replaceAll("'", "''")}',${parseFloat(warnConent.punkte)},${parseInt(warnConent.createdAt)},'${warnConent.by.toString().replaceAll("'", "''")}','${warnConent.byName.toString().replaceAll("'", "''")}','${warnConent.type.toString().replaceAll("'", "''")}',NULL);`)
                    reject(err)
                    return
                }
                resolve()
            })
        }
    })
}



exports.localization = function (category, string, translationString, args) {
    const lang = f.config().bot.lang
    const localization = require(`./files/strings/${lang}_lang.json`)
    try {
        let cat
        for (let attributename in localization) {
            if (attributename == category.toLowerCase()) {
                cat = localization[attributename]
                break;
            }
        }
        if (!cat) return `INVALID_CAT_${category.toUpperCase()}`

        let translation
        for (let attributename in cat) {
            if (attributename == string) {
                translation = cat[attributename]
                break;
            }
        }
        if (!translation) return `INVALID_STRING_${string.toUpperCase()}`

        let translate
        for (let attributename in translation) {
            if (attributename == translationString) {
                translate = translation[attributename]
                break;
            }
        }
        if (translationString == "exports" && typeof translate == "undefined") return {
            "usage": "NO_EXPORTS",
            "description": "NO_EXPORTS"
        }
        if (!translate) return `NO_TRANSLATION`

        if (!args) return translate;

        for (let index = 0; index < args.length; index++) {
            translate = translate.replace(`%${index}`, args[index])
        }

        return translate;
    } catch (error) {
        f.error(error, "functions.js", true)
        return "TRANSLATION_ERROR"
    }
}

exports.config = function (config) {
    try {
        return (JSON.parse(fs.readFileSync("./files/important files/config.json")))
    } catch {
        f.log("Error: Config file missing or damaged", 3)
        return {}
    }
}

exports.execute = function (command, message, client, prefix, args) {
    try {
        const commandFile = require(`./commands/${command}.js`) // Get the command file
        f.log(`Command execution reqeusted. Command: ${commandFile['name']}`)
        commandFile['run'](message, prefix, args, client) // Run the command
        f.log(`Command executed: ${commandFile['name']}`)
        return {
            code: 0
        };
    } catch (error) {
        f.log('Command execution failed.')
        if (error.code == 'MODULE_NOT_FOUND') return {
            code: 1,
            error: error
        };
        return {
            code: 2,
            error: error
        };
    }
}
exports.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.embed = function (channel, title, colour, message, returnEmbedOnly) {
    if (!returnEmbedOnly) {
        const embed = new discord.MessageEmbed()
            .setTitle(title)
            .setColor(colour)
            .setDescription(message);
        channel.reply({
            embeds: [embed]
        })
    } else {
        const embed = new discord.MessageEmbed()
            .setTitle(title)
            .setColor(colour)
            .setDescription(message);
        return embed;
    }
}

exports.error = function (err, customFileName, sendConsoleLog) {
    try {
        let error = `\n${err.code}\n\n${err.stack}` // Get the error and the error stacktrace
        let date = new Date() // The date when the error occured
        let iso_date = date.toISOString() // Gets the iso date
        let log_filename = `error_${iso_date}` // Generate the file name
        if (typeof customFileName == 'string') log_filename = `error_${iso_date}_${customFileName}`;
        log_filename = log_filename.replace(/\:/g, '.') // Replaces : with . so its a valid format

        fs.writeFileSync(`./files/log/${log_filename}.txt`, error) // Write the file
        if (sendConsoleLog) f.log(`An error occured! The error can be found in ./files/log/${log_filename}.txt`) // log that a error occured
        f.log(err, 3)
    } catch (error) {
        console.log('The error handler had a error.\n\n', error)
    }
}

exports.log = function (log, customStackNum, override, msgOverride) {
    let stackNum = 2
    if (customStackNum) stackNum = customStackNum;
    let lineNumber = new Error().stack.split("at ")[stackNum].trim()
    lineNumber = path.basename(lineNumber)
    lineNumber = lineNumber.replace(')', '')
    lineNumber = lineNumber.replace('(', '')
    const d = new Date()
    lineNumber = `[${d.getHours()}:${d.getMinutes()}.${d.getMilliseconds()}] - ${lineNumber}`

    if (typeof msgOverride != 'string') msgOverride = ">"
    if (logconsole == false) {
        if (devMode) console.log(`${lineNumber} ${msgOverride} ${log}`)
    }

    if (writeLog) {
        logQueue.push(`\n${lineNumber} ${msgOverride} ${log}`)
    }
}

exports.getServerConfig = function (guildID) {
    try {
        let file = JSON.parse(fs.readFileSync(`./files/serverConfigs/${guildID}.json`))
        return file;
    } catch (error) {
        return JSON.parse(fs.readFileSync("./files/serverConfigs/template.json"))
    }
}

exports.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}