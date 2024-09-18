import axios, { formToJSON } from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { db } from "../../../bot";

module.exports = {
	once: false,
	name: Events.InteractionCreate,

	async execute(interaction: ButtonInteraction) {
		if(!interaction.isButton()) return;
		
		const args = interaction.customId.split("-")
		if(args[0] !== "form") return;
		if(args[1] !== "feedback") return;

		// Create the form
		const modal = new ModalBuilder()
			.setCustomId("feedback")
			.setTitle("Feedback")
		
		// Add Text Input
		const textInput = new TextInputBuilder()
		.setCustomId("text")
		.setLabel("Feedback")
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true)
		.setPlaceholder("Deine Nutzer ID und Dein Nutzername werden geteilt.")
		.setMaxLength(750)

		const textActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

		// Add rows to modal
		modal.addComponents(textActionRow);

		// Show the modal
		interaction.showModal(modal);
	}
}