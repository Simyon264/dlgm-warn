const f = require('./functions.js') // general functions
const {
    fork
} = require('child_process'); // for restarts n shit
const readline = require('readline'); // Input
const colors = require('colours') // colors obvs

startChild()

function startChild() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: function completer(line) {
            const completions = 'stop restart reload slashreload'.split(' ')
            const hits = completions.filter(function (c) { return c.indexOf(line) == 0 })
            // show all completions if none found
            return [hits.length ? hits : completions, line]
        }
    });

    let bot = fork('./client.js', process.argv);

    bot.on("message", async (message) => {
        switch (message) {
            case "RESTART":
                restart()
                break;
            case "SHUTDOWN":
                stop()
                break
            case "reloaded":
                console.log("Reloaded.")
                break;
        }
    })

    rlLoop()

    async function restart() {
        await f.sleep(5000)
        bot.kill("SIGINT");
        startChild()
    }

    async function stop() {
        await f.sleep(5000)
        bot.kill()
    }

    function rlLoop() {
        rl.question("", (answer) => {
            switch (answer) {
                case "stop":
                    rl.close()
                    bot.send("stop")
                    stop()
                    break;
                case "restart":
                    rl.close()
                    bot.send("restart")
                    restart()
                    break;
                case "reload":
                    bot.send("reload")
                    rlLoop()
                    break;
                case "slashreload":
                    bot.send("sreload")
                    rlLoop()
                    break;
                default:
                    console.log(colors.red(`Unknown command: "${answer}"`))
                    rlLoop()
                    break;
            }
        })
    }
}