import { CommandInteraction, SlashCommandBuilder  } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong. Used to test the bot.'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply("Pong");
	},
};
