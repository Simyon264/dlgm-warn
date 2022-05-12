const f = require('../functions.js');
const discord = require('discord.js');
const fs = require("fs")
const mathjs = require('mathjs')

module.exports = {
	name: 'calc',
	description: f.localization("commands","calc","exports").description,
	category: 'general',
	modcommand: false,
	usage: f.localization("commands","calc","exports").usage,
	perms: '',
	alias: [],
	cooldown: 5,
    run: async function (message, prefix, args, client) {
        if (args.length == 1) {
            let currentCalc = calcMap.get(message.author.id)

            const button1_1 = new discord.MessageButton()
                .setLabel("Clear")
                .setStyle("DANGER")
                .setCustomId("calc_clear")
            const button1_2 = new discord.MessageButton()
                .setLabel("(")
                .setStyle("PRIMARY")
                .setCustomId("calc_(")
            const button1_3 = new discord.MessageButton()
                .setLabel(")")
                .setStyle("PRIMARY")
                .setCustomId("calc_)")
            const button1_4 = new discord.MessageButton()
                .setLabel("DEL")
                .setStyle("DANGER")
                .setCustomId("calc_del")


            const button2_1 = new discord.MessageButton()
                .setLabel("7")
                .setStyle("SECONDARY")
                .setCustomId("calc_7")
            const button2_2 = new discord.MessageButton()
                .setLabel("8")
                .setStyle("SECONDARY")
                .setCustomId("calc_8")
            const button2_3 = new discord.MessageButton()
                .setLabel("9")
                .setStyle("SECONDARY")
                .setCustomId("calc_9")
            const button2_4 = new discord.MessageButton()
                .setLabel("/")
                .setStyle("PRIMARY")
                .setCustomId("calc_divide")


            const button3_1 = new discord.MessageButton()
                .setLabel("4")
                .setStyle("SECONDARY")
                .setCustomId("calc_4")
            const button3_2 = new discord.MessageButton()
                .setLabel("5")
                .setStyle("SECONDARY")
                .setCustomId("calc_5")
            const button3_3 = new discord.MessageButton()
                .setLabel("6")
                .setStyle("SECONDARY")
                .setCustomId("calc_6")
            const button3_4 = new discord.MessageButton()
                .setLabel("-")
                .setStyle("PRIMARY")
                .setCustomId("calc_sub")


            const button4_1 = new discord.MessageButton()
                .setLabel("1")
                .setStyle("SECONDARY")
                .setCustomId("calc_1")
            const button4_2 = new discord.MessageButton()
                .setLabel("2")
                .setStyle("SECONDARY")
                .setCustomId("calc_2")
            const button4_3 = new discord.MessageButton()
                .setLabel("3")
                .setStyle("SECONDARY")
                .setCustomId("calc_3")
            const button4_4 = new discord.MessageButton()
                .setLabel("x")
                .setStyle("PRIMARY")
                .setCustomId("calc_mult")


            const button5_1 = new discord.MessageButton()
                .setLabel("0")
                .setStyle("SECONDARY")
                .setCustomId("calc_0")
            const button5_2 = new discord.MessageButton()
                .setLabel(".")
                .setStyle("SECONDARY")
                .setCustomId("calc_dot")
            const button5_3 = new discord.MessageButton()
                .setLabel("=")
                .setStyle("SUCCESS")
                .setCustomId("calc_doMath")
            const button5_4 = new discord.MessageButton()
                .setLabel("+")
                .setStyle("PRIMARY")
                .setCustomId("calc_add")
        
            let buttonRow_1 = new discord.MessageActionRow()
                .addComponents(button1_1)
                .addComponents(button1_2)
                .addComponents(button1_3)
                .addComponents(button1_4)

            let buttonRow_2 = new discord.MessageActionRow()
                .addComponents(button2_1)
                .addComponents(button2_2)
                .addComponents(button2_3)
                .addComponents(button2_4)

            let buttonRow_3 = new discord.MessageActionRow()
                .addComponents(button3_1)
                .addComponents(button3_2)
                .addComponents(button3_3)
                .addComponents(button3_4)

            let buttonRow_4 = new discord.MessageActionRow()
                .addComponents(button4_1)
                .addComponents(button4_2)
                .addComponents(button4_3)
                .addComponents(button4_4)

            let buttonRow_5 = new discord.MessageActionRow()
                .addComponents(button5_1)
                .addComponents(button5_2)
                .addComponents(button5_3)
                .addComponents(button5_4)
        
            let sentMessage

            if (currentCalc) {
                sentMessage = await message.reply({ content: "`" + currentCalc + "`", components: [buttonRow_1, buttonRow_2, buttonRow_3, buttonRow_4, buttonRow_5] })
            } else {
                sentMessage = await message.reply({ content: "Warte auf eingabe...", components: [buttonRow_1, buttonRow_2, buttonRow_3, buttonRow_4, buttonRow_5] })
                calcMap.set(message.author.id, "")
            }

            setTimeout(() => {
                sentMessage.edit({
                    content: "Zeitüberschreitung beim Rechner.",
                    components: []
                })
            }, 600000);

            const collector = sentMessage.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 600000
            });

            collector.on('collect', async i => {
                currentCalc = calcMap.get(message.author.id)
                i.deferUpdate()
                if (i.user.id === message.author.id) {
                    switch (i.customId) {
                        case "calc_clear":
                            currentCalc = "";
                            calcMap.set(message.author.id, currentCalc)
                            sentMessage.edit({ content: "Warte auf eingabe..." })
                            return;
                        case "calc_(":
                            currentCalc = currentCalc + "(";
                            break;
                        case "calc_)":
                            currentCalc = currentCalc + ")";
                            break;
                        case "calc_del":
                            currentCalc = currentCalc.slice(0, -1)
                            break;
                        case "calc_divide":
                            currentCalc = currentCalc + "/";
                            break;
                        case "calc_sub":
                            currentCalc = currentCalc + "-";
                            break;
                        case "calc_mult":
                            currentCalc = currentCalc + "*";
                            break;
                        case "calc_dot":
                            currentCalc = currentCalc + ".";
                            break;
                        case "calc_add":
                            currentCalc = currentCalc + "+";
                            break;
                        case "calc_doMath":
                            let result = ""
                            try {
                                result = eval(currentCalc)
                            } catch (error) {
                                switch (error.message) {
                                    case "Unexpected token ')'":
                                    case "Unexpected token '('":
                                    case "Unexpected token '*'":
                                    case "Unexpected token '+'":
                                    case "Unexpected token '-'":
                                    case "Unexpected token '/'":
                                    case "Invalid left-hand side expression in postfix operation":
                                    case "Unexpected number":
                                    case "Unexpected end of input":
                                        result = "Syntax Fehler."
                                        break;
                                    default:
                                        result = "Fehler."
                                        console.log(error.message)
                                        break;
                                }
                            }
                            sentMessage.edit({ content: "`" + currentCalc + ` = ${result}` + "`" })
                            return;
                        default:
                            currentCalc = currentCalc + i.customId.charAt(i.customId.length - 1);
                            break;
                    }
                    calcMap.set(message.author.id, currentCalc)
                    if (currentCalc != "") {
                        sentMessage.edit({ content: `\`${currentCalc}\`` })
                    }
                }
            })
        } else {
            args.splice(0, 1)
            args = args.join(" ")
            try {
                message.reply(`\`${args} = ${mathjs.evaluate(args)}\``)
            } catch (error) {
                message.reply(`\`${error.message}\``)
            }
        }
    }
}