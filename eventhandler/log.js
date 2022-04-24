const fs = require("fs")
const f = require("../functions.js")
const Discord = require("discord.js")
const { time } = require('@discordjs/builders');

module.exports = {
    run: function (client) {
        try {
            async function sendLogMessage(embed) {
                const channel = await client.channels.fetch(f.config().bot.logChannelId)
                if (channel) channel.send({content: "** **", embeds:[embed]})
            }
            
            client.on("guildMemberUpdate", async (oldMember, newMember) => {
                const user = newMember.user
                if (oldMember.nickname !== newMember.nickname) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
                        .setDescription(`**Nickname geändert**`)
                        .addField("Alter Nickname", oldMember.nickname || "*nichts*")
                        .addField("Neuer Nickname", newMember.nickname || "*nichts*")
                        .setFooter(`User ID: ${user.id}`)
                        .setColor(f.config().messageColours.member)
                    sendLogMessage(embed)
                }
                if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
                    if (!oldMember.communicationDisabledUntilTimestamp) {
                        const embed = new Discord.MessageEmbed()
                            .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
                            .setDescription(`**<@${user.id}> (${user.tag}) wurde getimeouted**`)
                            .addField(`Getimeouted bis`, time(newMember.communicationDisabledUntilTimestamp))
                            .setFooter(`User ID: ${user.id}`)
                            .setColor(f.config().messageColours.member)
                        sendLogMessage(embed)
                    } else {
                        const embed = new Discord.MessageEmbed()
                            .setAuthor(user.tag, user.avatarURL({ dynamic: true }))
                            .setDescription(`**Timeout für <@${user.id}> (${user.tag}) wurde entfernt**`)
                            .setColor(f.config().messageColours.member)
                            .setFooter(`User ID: ${user.id}`)
                        sendLogMessage(embed)
                    }
                }
            })

            client.on("channelCreate", async (channel) => {
                const AuditLogFetch = await channel.guild.fetchAuditLogs({ limit: 1, type: "CHANNEL_CREATE" })
                
                if (!AuditLogFetch.entries.first()) return;
                if (channel.type == "DM" || channel.type == "GROUP_DM") return;

                const Entry = AuditLogFetch.entries.first()

                const embed = new Discord.MessageEmbed()
                    .addField("Name:", channel.name)
                    .addField("ID:", channel.id)
                    .addField(`Erstellt von:`, `${Entry.executor.tag || "Jemanden"}`)
                    .setColor(f.config().messageColours.info)
                    .setTimestamp(channel.createdTimestamp)
                switch (channel.type) {
                    case "GUILD_NEWS":
                    case "GUILD_TEXT":
                        embed.setDescription("**Textkanal erstellt.**")
                        break;
                    case "GUILD_STAGE_VOICE":
                    case "GUILD_VOICE":
                        embed.setDescription("**Sprachkanal erstellt.**")
                        break;
                    case "GUILD_CATEGORY":
                        embed.setDescription("**Kategorie erstellt.**")
                        break;
                    case "GUILD_NEWS_THREAD":
                    case "GUILD_PUBLIC_THREAD":
                    case "GUILD_PRIVATE_THREAD":
                    case "GUILD_STAGE_VOICE":
                        embed.setDescription("**Thread erstellt.**")
                        break;
                    default:
                        embed.setDescription(`**${channel.type} erstellt.**`)
                        break;
                }
                sendLogMessage(embed)
            })

            client.on("channelDelete", async (channel) => {
                const AuditLogFetch = await channel.guild.fetchAuditLogs({ limit: 1, type: "CHANNEL_DELETE" })
                
                if (!AuditLogFetch.entries.first()) return;
                if (channel.type == "DM" || channel.type == "GROUP_DM") return;

                const Entry = AuditLogFetch.entries.first()

                const embed = new Discord.MessageEmbed()
                    .addField("Name:", channel.name)
                    .addField("ID:", channel.id)
                    .addField(`Gelöscht von:`, `${Entry.executor.tag || "Jemanden"}`)
                    .setColor(f.config().messageColours.info)
                    .setTimestamp(channel.createdTimestamp)
                switch (channel.type) {
                    case "GUILD_NEWS":
                    case "GUILD_TEXT":
                        embed.setDescription("**Textkanal gelöscht.**")
                        break;
                    case "GUILD_STAGE_VOICE":
                    case "GUILD_VOICE":
                        embed.setDescription("**Sprachkanal gelöscht.**")
                        break;
                    case "GUILD_CATEGORY":
                        embed.setDescription("**Kategorie gelöscht.**")
                        break;
                    case "GUILD_NEWS_THREAD":
                    case "GUILD_PUBLIC_THREAD":
                    case "GUILD_PRIVATE_THREAD":
                    case "GUILD_STAGE_VOICE":
                        embed.setDescription("**Thread gelöscht.**")
                        break;
                    default:
                        embed.setDescription(`**${channel.type} gelöscht.**`)
                        break;
                }
                sendLogMessage(embed)
            })

            client.on("guildBanAdd", async (guildBan) => {
                const AuditLogFetch = await guildBan.guild.fetchAuditLogs({ limit: 1, type: "MEMBER_BAN_ADD" })
                
                if (!AuditLogFetch.entries.first()) return;
                
                const Entry = AuditLogFetch.entries.first()

                const embed = new Discord.MessageEmbed()
                    .setDescription("**Nutzer gebannt.**")
                    .addField(`Gebannt von:`, `${Entry.executor.tag || "Jemanden"}`)
                    .addField("Nutzer:", `<@${guildBan.user.id}> (${guildBan.user.tag})`)
                    .addField("Grund:", Entry.reason || "Kein Grund angegeben.")
                    .setThumbnail(guildBan.user.avatarURL({ dynamic: true }))
                    .setColor(f.config().messageColours.warn)
                sendLogMessage(embed)
            })

            client.on("guildBanRemove", async (guildBan) => {
                const AuditLogFetch = await guildBan.guild.fetchAuditLogs({ limit: 1, type: "MEMBER_BAN_REMOVE" })
                
                if (!AuditLogFetch.entries.first()) return;
                
                const Entry = AuditLogFetch.entries.first()

                const embed = new Discord.MessageEmbed()
                    .setDescription("**Nutzer entbannt.**")
                    .addField(`Entbannt von:`, `${Entry.executor.tag || "Jemanden"}`)
                    .addField("Nutzer:", `<@${guildBan.user.id}> (${guildBan.user.tag})`)
                    .setThumbnail(guildBan.user.avatarURL({ dynamic: true }))
                    .setColor(f.config().messageColours.member)
                sendLogMessage(embed)
            })

            client.on("guildMemberAdd", (guildMember) => {
                const embed = new Discord.MessageEmbed()
                    .setDescription("**Nutzer beigetreten.**")
                    .addField(`Nutzer:`, `<@${guildMember.user.id}> (${guildMember.user.tag})`)
                    .addField(`Discord beigetreten:`, time(guildMember.user.createdAt, 'R'))
                    .setThumbnail(guildMember.user.avatarURL({ dynamic: true }))
                    .setColor(f.config().messageColours.member)
                sendLogMessage(embed)
            })

            client.on("guildMemberRemove", async (guildMember) => {
                const AuditLogFetch = await guildMember.guild.fetchAuditLogs({ limit: 1, type: "MEMBER_KICK"})
                
                let kicked = false;

                if (AuditLogFetch.entries.first()) {
                    const Entry = AuditLogFetch.entries.first()
                    const timestamp = new Date().getTime()
                    if ((timestamp - Entry.createdTimestamp) <= 5000) {
                        kicked = true;   
                    }
                }

                if (kicked) {
                    const Entry = AuditLogFetch.entries.first()
                    const embed = new Discord.MessageEmbed()
                        .setDescription("**Nutzer gekickt.**")
                        .addField(`Nutzer:`, `<@${guildMember.user.id}> (${guildMember.user.tag})`)
                        .addField(`Moderator:`, `<@${Entry.executor.id}> (${Entry.executor.tag || "Jemanden"})`)
                        .addField(`Discord beigetreten:`, time(guildMember.user.createdAt, 'R'))
                        .addField(`Server beigetreten:`, time(guildMember.joinedAt, 'R'))
                        .setThumbnail(guildMember.user.avatarURL({ dynamic: true }))
                        .setColor(f.config().messageColours.member)
                    sendLogMessage(embed)
                } else {
                    const embed = new Discord.MessageEmbed()
                        .setDescription("**Nutzer verlassen.**")
                        .addField(`Nutzer:`, `<@${guildMember.user.id}> (${guildMember.user.tag})`)
                        .addField(`Discord beigetreten:`, time(guildMember.user.createdAt, 'R'))
                        .addField(`Server beigetreten:`, time(guildMember.joinedAt, 'R'))
                        .setThumbnail(guildMember.user.avatarURL({ dynamic: true }))
                        .setColor(f.config().messageColours.member)
                    sendLogMessage(embed)
                }
            })

            client.on("messageUpdate", (oldMessage, newMessage) => {
                if (oldMessage.content == newMessage.content) return;
                if (f.config().special.logBlacklist.includes(newMessage.channel.id)) return;
                const embed = new Discord.MessageEmbed()
                    .setAuthor(newMessage.author.tag, newMessage.author.avatarURL({ dynamic: true }))
                    .setDescription(`**Nachricht in <#${oldMessage.channel.id}> wurde bearbeitet. [Springe zur Nachricht](${newMessage.url})**`)
                    .addField("Alte Nachricht", oldMessage.content || "*nichts*")
                    .addField("Neue Nachricht", newMessage.content || "*nichts*")
                    .setColor(f.config().messageColours.info)
                    .setFooter(`User ID: ${newMessage.author.id}`)
                sendLogMessage(embed);
            })

            client.on("messageDelete", async (message) => {
                if (message.author.bot) return;
                if (f.config().special.logBlacklist.includes(message.channel.id)) return;

                await f.sleep(2000)

                const AuditLogFetch = await message.guild.fetchAuditLogs({ limit: 1, type: "MESSAGE_DELETE"})
                const Entry = AuditLogFetch.entries.first()

                if (!Entry) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
                        .setDescription(`**Nachricht in <#${message.channel.id}> wurde gelöscht.**`)
                        .setColor(f.config().messageColours.info)
                        .setFooter(`User ID: ${message.author.id}`)
                    if (message.content == "** **" || message.content == '' || message.content == ' ') {
                        embed.addField("Nachricht", "*nichts*")
                    } else {
                        embed.addField("Nachricht", message.content)                    
                    }
                    sendLogMessage(embed);
                } else {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
                        .setDescription(`**Nachricht von <@${message.author.id}> (${message.author.tag}) in <#${message.channel.id}> wurde gelöscht.**`)
                        .setColor(f.config().messageColours.info)
                        .setFooter(`User ID: ${message.author.id}`)
                    if (message.content == "** **" || message.content == '' || message.content == ' ') {
                        embed.addField("Nachricht", "*nichts*")
                    } else {
                        embed.addField("Nachricht", message.content)                    
                    }
                    if (Entry.target.id === message.author.id && (Entry.createdTimestamp > (Date.now() - 2000))) {
                        embed.addField("Gelöscht von", `<@${Entry.executor.id}> (${Entry.executor.tag})`)
                    } else {
                        embed.addField("Gelöscht von", `<@${message.author.id}> (${message.author.tag})`)
                    }

                    sendLogMessage(embed);
                }
            })
        } catch (err) {
            f.error(err, "log.js", true)
        }
    }
}