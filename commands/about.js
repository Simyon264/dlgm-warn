const f = require('../functions.js');
const discord = require('discord.js');


module.exports = {
	name: 'about',
	description: f.localization("commands","about","exports").description,
	category: 'general',
	modcommand: false,
	usage: f.localization("commands","about","exports").usage,
	perms: '',
	alias: [],
	cooldown: 1,
	run: function (message, prefix, args, client) {
		// Get the info color
		const colourInfo = f.config().messageColours.info;
		f.log(`Got info colour, ${colourInfo}`)

		// Get the days, minutes and seconds
		let days = Math.floor(client.uptime / 86400000);
		let hours = Math.floor(client.uptime / 3600000) % 24;
		let minutes = Math.floor(client.uptime / 60000) % 60;
		let seconds = Math.floor(client.uptime / 1000) % 60;
		f.log(`Got uptime, ${days}d ${hours}h ${minutes}m ${seconds}s `)

		// Construct the embed
		let embed = new discord.MessageEmbed()
			.setTitle(f.localization("commands","about","about"))
			.setColor(colourInfo)
			.setDescription(f.localization("commands","about","description"))
			.addField(f.localization("commands","about","version"), f.config().bot.version)
			.addField(f.localization("commands","about","authers"), f.config().bot.Authors)
			.setThumbnail(client.user.avatarURL())
			.addField(f.localization("commands","about","uptime"), `${days}d ${hours}h ${minutes}m ${seconds}s`)
		// Send the embed
		f.log("Message sent.")
		message.reply({ embeds: [embed] })
	}
}