// DO NOT CHANGE THIS FILE
// TO CHANGE THE BEHAVIOUR
// IF YOU DO, UPDATES WILL
// BE WAY HARDER 2 INSTALL

// Imports
import { Client, ClientEvents, Collection, CommandInteraction, Events, GatewayIntentBits, Interaction, REST, RESTPutAPIApplicationCommandsResult, Routes, SlashCommandBuilder } from "discord.js"
import * as dotenv from "dotenv";
import { PathLike } from "fs";
import RecursiveReadDir from './modules/recursiveReadDir.js';
import { configuration } from "./config.js";
import { MongoClient } from "mongodb";
import { env } from "process";
import getUnixTimestamp from "./modules/getUnixTimestamp.js";
import { botCommandExport } from "./types/commandExport.js";

dotenv.config();

// Log Intro
let currentDate = new Date()
console.log("    -- BEGIN BOT LOG INTRO --");
console.log(`    @${currentDate.toISOString()}`);
console.log("    -- BEGIN BOT LOG OUTRO --");

// Configurations
const botIntents: GatewayIntentBits[] = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
]

const eventsPath: PathLike = "./bot/events"
const commandsPath: PathLike = "./bot/commands"

// Create Client
console.log("⌛ Creating Client");
const client = new Client({ intents: botIntents }) as Client & { commands: Collection<any, any> };
client.commands = new Collection();

// Index & Register Command Routes
console.log("✅ Client Created");
console.log("⌛ Indexing Command Routes");

let commands: {}[] = []

const commandFiles = RecursiveReadDir(commandsPath)
for (let file of commandFiles) {
	const command: { data: SlashCommandBuilder, execute: Function } = require("./" + file)

	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);

		console.log("   🔗 " + file);
	} else {
		console.log(`   ❌ ${file} is missing "data" or "execute" property. Index skipped`);
	}
}

console.log("✅ Indexed commands");

// Deploy Commands
console.log("🕝 Deploying Commands to Discord");

const rest: REST = new REST().setToken(process.env.BOT_TOKEN);
(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(process.env.APP_ID),
			{ body: commands },
		);

		console.log(`☑️  Successfully deployed and reloaded commands`);
	} catch (error) {
		console.error(error);
	}
})();

// Bind Command Handler
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command: botCommandExport = client.commands.get(interaction.commandName);
	const executedCommandsCollection = db.collection("required:command_executions")

	// Cooldown Manager
	let lastExecution = await executedCommandsCollection.findOne({
		cooldown_till: {
			$gt: getUnixTimestamp()
		}
	})

	if (lastExecution !== null) {
		interaction.reply({
			content: `⌛ You're going a bit too fast... You can run this command again in <t:${lastExecution.cooldown_till}:R>`,
			ephemeral: true
		})

		return;
	}

	// Insert Command to DB
	const cooldown = command.settings?.cooldown || 0
	await executedCommandsCollection.insertOne({
		timestamp: getUnixTimestamp(),
		cooldown_till: getUnixTimestamp() + cooldown,
		executor: interaction.user.id,
		command_details: command.data
	})

	if (!command) {
		await interaction.reply({ content: 'We couldnt index this command. Please contact `@ratzifutzi` for support.', ephemeral: true });
		console.log(`⚠️ There is no command matching ${interaction.commandName}.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'We ran into issues while trying to execute this command. Please contact `@ratzifutzi` for support.', ephemeral: true });
		} else {
			await interaction.reply({ content: 'We ran into issues while trying to execute this command. Please contact `@ratzifutzi` for support.', ephemeral: true });
		}
	}
})

// Bind Event Routes
console.log("⌛ Binding Event Routes");

const eventFiles = RecursiveReadDir(eventsPath)
for (let file of eventFiles) {
	const event: { once: boolean, name: keyof ClientEvents, execute: Function } = require("./" + file)

	if (event.once) {
		try {
			client.once(event.name, (...args) => event.execute(...args));
		} catch (error) {
			console.log("❌ Error with", event.name);
			console.log(error);
		}
	} else {
		try {
			client.on(event.name, (...args) => event.execute(...args));
		} catch (error) {
			console.log("❌ Error with", event.name);
			console.log(error);
		}
	}

	console.log("   🔗 " + file);
}

console.log("✅ Events bound");

// Database
console.log("⌛ Preparing Database");

const db_client: MongoClient = new MongoClient(env.DB_URI)
db_client.connect()

const db = db_client.db(env.DB_NAME)

console.log("✅ Database prepared");

// Login to Discord
console.log("🕝 Logging in to Discord");
client.login(process.env.BOT_TOKEN)

// Exports
export {
	db
}