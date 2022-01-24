# DLGM-Warnbot

Join the [Discord](https://discord.gg/PAPf95aQPp)

Warn-bot for DLGM.

## How to install.

1. Make sure you have Node.js installed.
2. Clone the repository and run `npm install` in the folder.
3. Type `node bot.js`
4. Type in your bot token.
5. You are done!

## Launch options

Wanna disable the console? Or have no colours? Well, we have launch options!
`npm start` will launch the option `logconsole` enabled. But I will first tell you what we have:

- `createdb` - Creates the Warn Database.
- `resetdb` - Drops the Warn Database.
- `convert` - Converts the `.JSON` warns to the Database.
- `noconsole` - Disables all console output.
- `debug` - Will output debug messages to the console.
- `nowrite` - Disables log file writting. _NOTE:_ `logconsole` will override this for it's writes.
- `logconsole` - Writes all console output into the log file.
- `showfilestart` - Shows the file start.
- `nocolour` - Disables colour in the console.

To enable one of these just have it in the args when starting the bot. So:
`node bot.js [launch options]`
These have to be seperated by spaces. So if we would want to disable colour and have all debug output put into the console we would do:
`node bot.js nocolour debug`
