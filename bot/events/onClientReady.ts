import { Client, Events } from "discord.js";

module.exports = {
	once: true,
	name: Events.ClientReady,

	async execute(client: Client) {
		console.log(`☑️  Logged in as ${client.user?.tag}`);
	}
}