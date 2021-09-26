const f = require('../functions.js');
const discord = require('discord.js');

module.exports = {
    name: 'memory',
    description: f.localization('commands','memory','exports').description,
    category: 'generel',
    modcommand: false,
    usage: f.localization('commands','memory','exports').usage,
    perms: '',
    alias: ["mem"],
    cooldown: 5,
    run: function (message, prefix, args, client) {
        const used = process.memoryUsage();
        const embed = f.embed(message, "Memory used.", f.config().colorInfo, "", true)
        embed.setFooter("heapTotal and heapUsed refer to V8's memory usage. external refers to the memory usage of C++ objects bound to JavaScript objects managed by V8. rss, Resident Set Size, is the amount of space occupied in the main memory device (that is a subset of the total allocated memory) for the process, which includes the heap, code segment and stack.")
        for (let key in used) {
            embed.addField(key,`\`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB\`\n`)
        }
        
        message.reply({ embeds: [embed]})
    }
}