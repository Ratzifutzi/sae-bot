import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Events, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { db } from "../../../bot";

module.exports = {
	once: false,
	name: Events.InteractionCreate,

	async execute(interaction: ModalSubmitInteraction) {
		if (!interaction.isModalSubmit()) return;

		const args = interaction.customId.split("-")
		if (args[0] !== "infoscreen") return;
		if (args[1] !== "subscription") return;

		const classId = interaction.fields.getTextInputValue("classId").toUpperCase()

		// Set database
		// Check if already subscribed
		const subscriptionCollection = db.collection("subscriptions")

		const isSubscribed = await subscriptionCollection.findOne({
			"user_id": interaction.user.id,
			"subscription_id": "infoscreen.notifications"
		}) !== null

		// Check if already subscribed to avoid multiple documents
		if(isSubscribed) {
			interaction.reply({
				ephemeral: true,
				content: "Du hast bereits den Kalender abonniert."
			})
			
			return
		}

		// Insert document
		await subscriptionCollection.insertOne({
			"user_id": interaction.user.id,
			"subscription_id": "infoscreen.notifications",
			"class_id": classId
		})

		// Send confirmation
		interaction.reply({
			ephemeral: true,
			content: "Ab sofort erhälst du jeden Tag um **07:00** Uhr, eine DM mit all deinen heutigen Terminen für die Klasse **" + classId + "**!"
		})
	}
}