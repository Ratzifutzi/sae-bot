"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    once: true,
    name: discord_js_1.Events.ClientReady,
    async execute(client) {
        console.log(`☑️  Logged in as ${client.user?.tag}`);
    }
};
