// Imports
const fs = require("fs") // Filesystem
const discord = require("discord.js") // discord.js.... you should know this
const colors = require('colours') // used to print custom colours in the terminal
const readline = require("readline") // used for user to input bot token
const f = require('./functions.js') // general functions

// Defining global vars
global.devMode = false;
global.writeLog = true;
global.logconsole = false;
global.noconsole = false;
global.showfilestart = false;
global.nocolour = false;
global.logQueue = []

//This function executes every 5 seconds
global.tick = setInterval(function () {
    //console.log("called")
    if (logQueue.length > 0) {
        let file = fs.readFileSync('./files/log/latest.log', 'utf-8')
        logQueue.forEach(element => {
            file = file + element
        });
        logQueue = []
        fs.writeFileSync('./files/log/latest.log', file)
    }
},5000)

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
// Get args from the command that was used to start the bot
const args = process.argv.slice(2);
// Run through every args and execute some code if its a valid args
const errdelete = true
for (let index = 0; index < args.length; index++) {
    //This will just set some vars to true 
    switch (args[index]) {
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

console.log("Look into the readme for launch options!")
console.log("Starting bot...")
const client = new discord.Client({
    ws: {
        properties: {
            $browser: "Discord iOS"
        }
    },
    intents: [discord.Intents.FLAGS.GUILDS,discord.Intents.FLAGS.GUILD_MESSAGES]
}); // discord client

console.log("Deleting error files...")
const files = fs.readdirSync('./files/log')
for (let index = 0; index < files.length; index++) {
    if (files[index] != "latest.log") {
        fs.unlinkSync(`./files/log/${files[index]}`)
        f.log(`Deleted file: ${files[index]}`)
    }
    
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
    client.destroy()
    process.exit(code)
}

process.on('SIGINT', () => {
    exit(0)
})