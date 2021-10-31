module.exports = {
    help: "Returnt deinen Input.",
    permissionLevel: "user",
    run: function (args) {
        return new Promise((resolve, reject) => {
            resolve(`[ "${args.join('", "')}" ]`)
        })
    }
}