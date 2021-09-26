const f = require('../functions.js');
const fs = require('fs');
const discord = require('discord.js');

module.exports = {
	name: 'help',
	description: f.localization("commands","help","exports").description,
	category: 'general',
	modcommand: false,
	usage: f.localization("commands","help","exports").usage,
	perms: '',
	alias: ["h"],
	cooldown: 1,
	run: function (message, prefix, args) {
		function sendMsg(commandFile) {
			let cmdName = commandFile['name'];
			const cmdDesc = commandFile['description'];
			let cmdCategory = commandFile['category'];
			const cmdUsage = commandFile['usage'];
			let cmdRoles = commandFile['perms'];
			const cooldown = commandFile['cooldown']
			const aliases = commandFile['alias']

			let final = ""
			for (let index = 0; index < aliases.length; index++) {
				final = `${final}\`${aliases[index]}\`,`
			}

			cmdName = cmdName.charAt(0).toUpperCase() + cmdName.slice(1);
			cmdCategory = cmdCategory.charAt(0).toUpperCase() + cmdCategory.slice(1);
			cmdRoles = cmdRoles.charAt(0).toUpperCase() + cmdRoles.slice(1);

			const none = f.localization("commands","help","none")

			let embed = new discord.MessageEmbed()
				.setTitle(cmdName)
				.setColor(colourInfo)
				.addField(f.localization("commands","help","description"), cmdDesc || none)
				.addField(f.localization("commands","help","category"), cmdCategory || none)
				.addField(f.localization("commands","help","usage"), cmdUsage || none)
				.addField(f.localization("commands","help","permissions"), cmdRoles || none);
			embed.addField(f.localization("commands","help","cooldown"), cooldown + f.localization("commands","help","seconds") || none)
			embed.addField(f.localization("commands","help","aliases"), final || none)
			embed.setDescription(f.localization("commands","help","helptext",[prefix]))

			message.reply({ embeds: [embed] })
		}
		const colourInfo = f.config().messageColours.info;
		const colourWarn = f.config().messageColours.warn;

		if (args.length == 1) { // Check if a command was specifed
			const categories = f.config().commands.categories // Get all categories
			const files = fs.readdirSync('./commands');

			// Generate the embed
			let embed = new discord.MessageEmbed()
				.setTitle(f.localization("commands","help","helpmenucmd"))
				.setColor(colourInfo)
				.setDescription("");

			for (let i = 0; i < categories.length; i++) {
				let categoryArray = [];
				const categoryName = categories[i].charAt(0).toUpperCase() + categories[i].substring(1);

				for (let j = 0; j < files.length; j++) {
					let file = require(`./${files[j]}`);

					if (file.category == categories[i]) {
						categoryArray.push(`\`${file.name}\``);
					}
				}
				try {
					embed.addField(categoryName, categoryArray.join(", "));
				} catch (err) {
					f.log(`Category ${categoryName} has no commands.`)
				}
			}
			embed.addField(f.localization("commands","help","helpmenuspcmd"), f.localization("commands","help","helpmenuspbody",[prefix]))
			message.reply({ embeds: [embed] })
		} else if (args.length >= 2) {
			fs.stat(`./commands/${args[1]}.js`, function (err, stat) {
				if (err == null) {
					const commandFile = require(`./${args[1]}.js`);
					sendMsg(commandFile)
				} else if (err.code === 'ENOENT') {
					let dir = fs.readdirSync("./commands/")
					let commandFile2
					let found = false
					for (let index = 0; index < dir.length; index++) {
						commandFile2 = require(`../commands/${dir[index]}`);
						if (commandFile2['alias'].includes(args[1].toLowerCase())) {
							found = true;
							var newCommandFile = index
							index = dir.length;
							continue;
						}
					}
					if (found) {
						let commandFile = require(`../commands/${dir[newCommandFile]}`);
						sendMsg(commandFile)
					} else {
						f.embed(message, "", colourWarn, f.localization("commands","help","nocommand"));
					}
				} else {
					console.log(err);

					f.embed(message, "", colourWarn, f.localization("commands","help","error"));
				}
			});
		}
	}
}