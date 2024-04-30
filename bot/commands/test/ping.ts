import { CommandInteraction, SlashCommandBuilder  } from "discord.js";
import { BotCommandExportSettings, botCommandExport } from "../../../types/commandExport";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong. Used to test the bot.'),
	settings: {
		cooldown: 10
	},
	
	async execute(interaction: CommandInteraction) {
		await interaction.reply("Pong");
	},
} as botCommandExport;
