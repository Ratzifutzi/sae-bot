"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong. Used to test the bot.'),
    settings: {
        cooldown: 10
    },
    async execute(interaction) {
        await interaction.reply("Pong");
    },
};
