import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, Embed, EmbedBuilder, Events, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { db } from "../../../bot";

module.exports = {
	once: false,
	name: Events.InteractionCreate,

	async execute(interaction: ModalSubmitInteraction) {
		if (!interaction.isModalSubmit()) return;

		const args = interaction.customId.split("-")
		if (args[0] !== "feedback") return;

		const textField = interaction.fields.getTextInputValue("text")

		await interaction.deferReply({ephemeral: true});

		try {
			const ratzifutzi = await interaction.client.users.fetch("508557236415627264")

			await ratzifutzi.send({
				embeds: [
					new EmbedBuilder()
					.setTitle("Feedback erhalten")
					.setColor("White")

					.addFields(
						{
							"inline": true,
							"name": "User ID",
							"value": `<@${interaction.user.id}>`
						},
						{
							"inline": true,
							"name": "Displayname",
							"value": `${interaction.user.displayName}`
						}
						,
						{
							"inline": true,
							"name": "Username",
							"value": `@${interaction.user.globalName}`
						}
					)
					.addFields({
						"name": "Feedback",
						"value": textField
					})
				]
			})

			await interaction.editReply("✅ Feedback erfolgreich übermittelt!")
		} catch (error) {
			interaction.editReply({
				content: `❌ **Feedback konnte nicht übermittelt werden:**\`\`\`\n\n${error}\`\`\``
			})
		}
	}
}