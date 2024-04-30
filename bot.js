"use strict";
// DO NOT CHANGE THIS FILE
// TO CHANGE THE BEHAVIOUR
// IF YOU DO, UPDATES WILL
// BE WAY HARDER 2 INSTALL
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// Imports
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
const recursiveReadDir_js_1 = __importDefault(require("./modules/recursiveReadDir.js"));
const mongodb_1 = require("mongodb");
const process_1 = require("process");
const getUnixTimestamp_js_1 = __importDefault(require("./modules/getUnixTimestamp.js"));
dotenv.config();
// Log Intro
let currentDate = new Date();
console.log("    -- BEGIN BOT LOG INTRO --");
console.log(`    @${currentDate.toISOString()}`);
console.log("    -- BEGIN BOT LOG OUTRO --");
// Configurations
const botIntents = [
    discord_js_1.GatewayIntentBits.Guilds,
    discord_js_1.GatewayIntentBits.GuildMessages,
    discord_js_1.GatewayIntentBits.MessageContent,
];
const eventsPath = "./bot/events";
const commandsPath = "./bot/commands";
// Create Client
console.log("⌛ Creating Client");
const client = new discord_js_1.Client({ intents: botIntents });
client.commands = new discord_js_1.Collection();
// Index & Register Command Routes
console.log("✅ Client Created");
console.log("⌛ Indexing Command Routes");
let commands = [];
const commandFiles = (0, recursiveReadDir_js_1.default)(commandsPath);
for (let file of commandFiles) {
    const command = require("./" + file);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
        console.log("   🔗 " + file);
    }
    else {
        console.log(`   ❌ ${file} is missing "data" or "execute" property. Index skipped`);
    }
}
console.log("✅ Indexed commands");
// Deploy Commands
console.log("🕝 Deploying Commands to Discord");
const rest = new discord_js_1.REST().setToken(process.env.BOT_TOKEN);
(async () => {
    try {
        await rest.put(discord_js_1.Routes.applicationCommands(process.env.APP_ID), { body: commands });
        console.log(`☑️  Successfully deployed and reloaded commands`);
    }
    catch (error) {
        console.error(error);
    }
})();
// Bind Command Handler
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    const executedCommandsCollection = db.collection("required:command_executions");
    // Cooldown Manager
    let lastExecution = await executedCommandsCollection.findOne({
        cooldown_till: {
            $gt: (0, getUnixTimestamp_js_1.default)()
        }
    });
    if (lastExecution !== null) {
        interaction.reply({
            content: `⌛ You're going a bit too fast... You can run this command again in <t:${lastExecution.cooldown_till}:R>`,
            ephemeral: true
        });
        return;
    }
    // Insert Command to DB
    const cooldown = command.settings?.cooldown || 0;
    await executedCommandsCollection.insertOne({
        timestamp: (0, getUnixTimestamp_js_1.default)(),
        cooldown_till: (0, getUnixTimestamp_js_1.default)() + cooldown,
        executor: interaction.user.id,
        command_details: command.data
    });
    if (!command) {
        await interaction.reply({ content: 'We couldnt index this command. Please contact `@ratzifutzi` for support.', ephemeral: true });
        console.log(`⚠️ There is no command matching ${interaction.commandName}.`);
        return;
    }
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'We ran into issues while trying to execute this command. Please contact `@ratzifutzi` for support.', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'We ran into issues while trying to execute this command. Please contact `@ratzifutzi` for support.', ephemeral: true });
        }
    }
});
// Bind Event Routes
console.log("⌛ Binding Event Routes");
const eventFiles = (0, recursiveReadDir_js_1.default)(eventsPath);
for (let file of eventFiles) {
    const event = require("./" + file);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log("   🔗 " + file);
}
console.log("✅ Events bound");
// Database
console.log("⌛ Preparing Database");
const db_client = new mongodb_1.MongoClient(process_1.env.DB_URI);
db_client.connect();
const db = db_client.db(process_1.env.DB_NAME);
exports.db = db;
console.log("✅ Database prepared");
// Login to Discord
console.log("🕝 Logging in to Discord");
client.login(process.env.BOT_TOKEN);
