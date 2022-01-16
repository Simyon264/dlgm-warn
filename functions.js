const fs = require('fs')
const discord = require('discord.js')
const f = require('./functions.js')
const colors = require('colours')
const path = require("path");

exports.replaceAllCaseInsensitve = function(strReplace, strWith, string) {
    let esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let reg = new RegExp(esc, 'ig');
    return string.replace(reg, strWith);
}

exports.getWarns = function(id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT \"_rowid_\",* FROM \"main\".\"warns\" WHERE \"id\" LIKE '%${id}%' ESCAPE '/'`, (err, row) => {
                if (err) {
                    console.error(err.message)
                    reject("1")
                    return
                }
                console.log(row)
                resolve(row)
            })
        })
    })
}

exports.search = function(search) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT \"_rowid_\",* FROM \"main\".\"warns\" WHERE \"name\" LIKE '%${search}%' ESCAPE '/'`, (err, row) => {
                if (err) {
                    console.error(err.message)
                    reject("1")
                    return
                }
                // console.log(row)
                resolve(row)
            })
        })
    })
}

exports.getWarn = function(warnid) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT id id,warnid warnid,name name,grund grund,punkte punkte, createdAt createdAt, by by, byName byName, type type, extra extra FROM warns WHERE warnid = ?', [warnid], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                    return
                }
                f.log("GET REQUEST FOR WARNID: " + warnid)
                // console.log(row)
                resolve(row)
            })
        })
    })
}

exports.addWarn = function(steamID, warnConent) {
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



exports.localization = function(category, string, translationString, args) {
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

exports.config = function(config) {
    try {
        return (JSON.parse(fs.readFileSync("./files/important files/config.json")))
    } catch {
        f.log("Error: Config file missing or damaged", 3)
        return {}
    }
}

exports.execute = function(command, message, client, prefix, args) {
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
exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.embed = function(channel, title, colour, message, returnEmbedOnly) {
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

exports.error = function(err, customFileName, sendConsoleLog) {
    try {
        let error = `\n${err.code}\n\n${err.stack}` // Get the error and the error stacktrace
        let date = new Date() // The date when the error occured
        let iso_date = date.toISOString() // Gets the iso date
        let log_filename = `error_${iso_date}` // Generate the file name
        if (typeof customFileName == 'string') log_filename = `error_${iso_date}_${customFileName}`;
        log_filename = log_filename.replace(/\:/g, '.') // Replaces : with . so its a valid format

        fs.writeFileSync(`./files/log/${log_filename}.txt`, error) // Write the file
        if (sendConsoleLog) console.log(colors.red(`An error occured! The error can be found in ./files/log/${log_filename}.txt`)) // Console log that a error occured
        f.log(err, 3)
    } catch (error) {
        console.log('The error handler had a error.\n\n', error)
    }
}

exports.log = function(log, customStackNum, override, msgOverride) {
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

exports.getServerConfig = function(guildID) {
    try {
        let file = JSON.parse(fs.readFileSync(`./files/serverConfigs/${guildID}.json`))
        return file;
    } catch (error) {
        return JSON.parse(fs.readFileSync("./files/serverConfigs/template.json"))
    }
}

exports.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}