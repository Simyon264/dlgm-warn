module.exports = {
    help: "Bekomme die Memory vom Bot.",
    permissionLevel: "user",
    run: function (args) {
        return new Promise((resolve, reject) => {
            const used = process.memoryUsage();
            let cache = ""
            for (let key in used) {
                cache += `${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\n`
            }
            resolve(cache)
        })
    }
}