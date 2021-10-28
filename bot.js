// Imports
const fs = require("fs") // Filesystem
const discord = require("discord.js") // discord.js.... you should know this
const colors = require('colours') // used to print custom colours in the terminal
const readline = require("readline") // used for user to input bot token
const f = require('./functions.js') // general functions
const sqlite3 = require('sqlite3').verbose() // database

if (!fs.existsSync("./files/warns/warns.db")) fs.writeFileSync("./files/warns/warns.db", "")

global.db = new sqlite3.Database('./files/warns/warns.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
        return
    }
    console.log('Connected to the database.');
});

// Defining global vars
global.devMode = false;
global.writeLog = true;
global.logconsole = false;
global.noconsole = false;
global.showfilestart = false;
global.nocolour = false;
global.logQueue = []

if (!fs.existsSync("./files/log")) fs.mkdirSync("./files/log")
if (!fs.existsSync("./files/warns")) fs.mkdirSync("./files/warns")
if (!fs.existsSync("./files/cache")) fs.mkdirSync("./files/cache")

global.clearErrorLog = async function(why) {
    if (typeof why == "undefined") return
    return new Promise(async (resolve, reject) => {
        await fs.writeFileSync("./files/log/latest.log", "")
        f.log("Log File was reseted. Reason: " + why.toString())
        resolve()
    })
}

global.doTick = async function() {
    return new Promise(async (resolve, reject) => {
        f.log("Tick called.")
        if (logQueue.length > 0) {
            let file = fs.readFileSync('./files/log/latest.log', 'utf-8')
            logQueue.forEach(element => {
                file = file + element
            });
            logQueue = []
            await fs.writeFileSync('./files/log/latest.log', file)
            resolve()
        }
    })

}

//This function executes every 2 seconds
global.tick = setInterval(function() {
    // console.log("called")
    if (logQueue.length > 0) {
        let file = fs.readFileSync('./files/log/latest.log', 'utf-8')
        logQueue.forEach(element => {
            file = file + element
        });
        logQueue = []
        fs.writeFileSync('./files/log/latest.log', file)
    }
}, 2000)

/*/
// Redefining the console
console.log = function (d) {
    let newString = d.split('') // Put the array into a string with the sepperator being that weird char
    if (newString.length != 1) { // If the array is one long dont do anything cause then it will have no formatting
        // Loop through everything and remove the first 4 chars so the formatting is removed
        for (let index = 0; index < newString.length; index++) {
            newString[index] = newString[index].substring(4)
        }
    }
    // Put the new array into a string
    newString = newString.join('')

    if (logconsole) { // If the console should be logged
        f.log(newString, 3, { // Log the console message
            writeLog: true
        }, "CONSOLE >");
    }
    if (nocolour) d = newString;
    if (!noconsole) process.stdout.write(d + '\n'); // If the console is enabled write to the console.
};
/*/

let createDB = false
let convert = false
let returnBoot = false

// Get args from the command that was used to start the bot
const args = process.argv.slice(2);
// Run through every args and execute some code if its a valid args
const errdelete = true
for (let index = 0; index < args.length; index++) {
    //This will just set some vars to true 
    switch (args[index]) {
        case "resetdb":
            returnBoot = true
            db.exec('DROP TABLE "main"."warns";', (err) => {
                if (err) {
                    console.log(colors.red("ERROR: ") + "Can't reset Warn Table.\n" + err.message)
                }
            })
            break;
        case "createdb":
            createDB = true
            returnBoot = true
            db.exec('CREATE TABLE "warns" ("id"	TEXT,"warnid"	INTEGER,"name"	TEXT,"grund"	TEXT,"punkte"	BLOB,"createdAt"	TEXT,"by"	TEXT,"byName"	TEXT,"type"	TEXT,"extra"	TEXT)', (err) => {
                if (err) {
                    console.log(colors.red("ERROR: ") + "Can't create Warn Table.\n" + err.message)
                } else console.log("Database created.")
            })
            break;
        case "convert":
            if (createDB) return
            convert = true
            returnBoot = true
            clearErrorLog("Convert.").then(() => {
                console.log("Converting Warn files! Please wait...")
                let dir = fs.readdirSync("./files/warns")
                for (let index = 0; index < dir.length; index++) {
                    if (dir[index].includes(".json")) {
                        let arr = JSON.parse(fs.readFileSync(`./files/warns/${dir[index]}`))
                        for (let index = 0; index < arr.length; index++) {
                            let object = arr[index]
                            f.log(`ADDING ID: ${object.warnid}`)
                            f.log(`REASON: ${object.grund}`)
                            if (object.extra) {
                                db.exec(`INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${object.id.toString().replaceAll("'","''")}',${parseInt(object.warnid)},'${object.name.toString().replaceAll("'","''")}','${object.grund.toString().replaceAll("'","''")}',${parseFloat(object.punkte)},${parseInt(object.createdAt)},'${object.by.toString().replaceAll("'","''")}','${object.byName.toString().replaceAll("'","''")}','${object.type.toString().replaceAll("'","''")}','${object.extra.toString().replaceAll("'","''")}');`, (err) => {
                                    if (err) {
                                        f.log(`SQLERR: ${err.message}\nSQL COMMAND: INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${object.id.toString().replaceAll("'","''")}',${parseInt(object.warnid)},'${object.name.toString().replaceAll("'","''")}','${object.grund.toString().replaceAll("'","''")}',${parseFloat(object.punkte)},${parseInt(object.createdAt)},'${object.by.toString().replaceAll("'","''")}','${object.byName.toString().replaceAll("'","''")}','${object.type.toString().replaceAll("'","''")}','${object.extra.toString().replaceAll("'","''")}');`)
                                    }
                                    doTick().then(() => {
                                        f.log("Called tick: Convert.")
                                    })
                                })
                            } else {
                                db.exec(`INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${object.id.toString().replaceAll("'","''")}',${parseInt(object.warnid)},'${object.name.toString().replaceAll("'","''")}','${object.grund.toString().replaceAll("'","''")}',${parseFloat(object.punkte)},${parseInt(object.createdAt)},'${object.by.toString().replaceAll("'","''")}','${object.byName.toString().replaceAll("'","''")}','${object.type.toString().replaceAll("'","''")}',NULL);`, (err) => {
                                    if (err) {
                                        f.log(`SQLERR: ${err.message}\nSQL COMMAND: INSERT INTO "main"."warns"("id","warnid","name","grund","punkte","createdAt","by","byName","type","extra") VALUES ('${object.id.toString().replaceAll("'","''")}',${parseInt(object.warnid)},'${object.name.toString().replaceAll("'","''")}','${object.grund.toString().replaceAll("'","''")}',${parseFloat(object.punkte)},${parseInt(object.createdAt)},'${object.by.toString().replaceAll("'","''")}','${object.byName.toString().replaceAll("'","''")}','${object.type.toString().replaceAll("'","''")}',NULL);`)
                                    }
                                    doTick().then(() => {
                                        f.log("Called tick: Convert.")
                                    })
                                })
                            }

                        }
                        fs.unlinkSync(`./files/warns/${dir[index]}`)
                    }
                }
            })

            break;
        case "noconsole":
            noconsole = true;
            console.log(colors.magenta("Debug: no console") + " is now enabled")
            break;
        case "debug":
            devMode = true;
            console.log(colors.magenta("Debug: Debug mode") + " is now enabled")
            break;
        case "nowrite":
            writeLog = false;
            console.log(colors.magenta("Debug: no write") + " is now enabled")
            break;
        case "logconsole":
            logconsole = true;
            console.log(colors.magenta("Debug: log console") + " is now enabled")
            break;
        case "showfilestart":
            showfilestart = true;
            console.log(colors.magenta("Debug: show file start") + " is now enabled")
            break;
        case "nocolour":
            nocolour = true;
            console.log(colors.magenta("Debug: no colour") + " is now enabled")
            break;
        case "disableerrordelete":
            errdelete = false;
            console.log(colors.magenta("Debug: don't delete error logs") + " is now enabled")
            break;
        default:
            console.log(colors.red(`Argument `) + colors.yellow(args[index]) + colors.red(" is not supported."))
            break;
    }
}

if (writeLog) console.log("The debug log can be found in /log/latest.log")

if (createDB) console.log("CreateDB is a startparameter. Bot will not boot.")
if (convert) console.log("Convert is a startparameter. Bot will not boot.")

if (returnBoot) console.log("Boot return.")

console.log("Look into the readme for launch options!")
console.log("Starting bot...")
const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.DIRECT_MESSAGES, discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
}); // discord client

console.log("Deleting error files...")
const files = fs.readdirSync('./files/log')
for (let index = 0; index < files.length; index++) {
    if (files[index] != "latest.log") {
        fs.unlinkSync(`./files/log/${files[index]}`)
        f.log(`Deleted file: ${files[index]}`)
    }
}

if (!fs.existsSync("./files/warns/id.txt")) {
    console.log(colors.red("ID file not found, creating..."))
    fs.writeFileSync("./files/warns/id.txt", "0")
    console.log(colors.green("Done!"))
}

// Start readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask user for token, and store it
function token() {
    rl.question("Enter a Discord Bot Token: ", (answer) => {
        fs.writeFileSync("./files/important files/token.txt", answer)
        start()
    });
}

// Start bot
function start() {
    if (returnBoot) return;
    try {
        let token = fs.readFileSync("./files/important files/token.txt", "utf-8")

        console.log(colors.yellow("Starting files!"))
        let files = fs.readdirSync("./eventhandler/")

        // Start event handlers
        for (let i = 0; i < files.length; i++) {
            let event = require(`./eventhandler/${files[i]}`);
            if (showfilestart) console.log(colors.yellow(`Started: ${files[i]}`));
            event['run'](client);
        }
        console.log(colors.green("All files started, logging in!"))

        try {
            // Login using token
            client.login(token)
                .then(() => {
                    // Stop readline
                    rl.close()
                })
        } catch (err) {
            // If the error is not a token invalid error, throw it
            if (err.code !== "TOKEN_INVALID") throw err;
            console.log(colors.red("Error: ") + "The token provided is invalid!")
            token()
        }

    } catch (err) {
        // If the error is not a file not found error, throw it
        if (err.code !== "ENOENT") throw err;
        console.log(colors.red("Error: ") + "token is missing!")
        token();
    }
}

// Call start function
start();

// NOTE: Discord.js is stupid and without that a perms error without a catch would kill the bot. Even a try catch cant stop that error. TL:DR its the last fail safe - Simon
// This line makes me very uncomfortable - Joshua
// I'll work hard to try and remove this - Joshua
// And I will work hard to keep this in! - Simon
process.on("unhandledRejection", (err) => {
    f.log(`\nunhandledRejection!\n${err}\n\n${err.stack}`)
});

process.on('uncaughtException', (err) => {
    f.log(`\nuncaughtException!\n${err}\n\n${err.stack}`)
})

//process.on('message', (msg) => {
//    f.log(msg)
//})

function exit(code) {
    process.stdin.resume(); //so the program will not close instantly
    console.log('Destroying client...')
    f.log('Exiting...')
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closing the database connection.');
    });
    client.destroy()
    process.exit(code)
}

process.on('SIGINT', () => {
    exit(0)
})