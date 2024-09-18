import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, EmbedBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { db } from "../../../bot";

module.exports = {
	once: false,
	name: Events.InteractionCreate,

	async execute(interaction: ButtonInteraction) {
		if(!interaction.isButton()) return;
		
		const args = interaction.customId.split("-")
		if(args[0] !== "infoscreen") return;
		
		// Primary options menu
		if(args[1] === "options") {
			const actionRow = new ActionRowBuilder<ButtonBuilder>()

			// Create Subscription Button
			const subscriptionCollection = db.collection("subscriptions")

			const subscriptionDocument = await subscriptionCollection.findOne({
				"user_id": interaction.user.id,
				"subscription_id": "infoscreen.notifications"
			})
			const isSubscribed = subscriptionDocument !== null

			if(!isSubscribed) {
				actionRow.addComponents( new ButtonBuilder()
				.setCustomId("infoscreen-subscribe")
				.setLabel("Kalender abonnieren")
				.setEmoji("<:bell:1283857360028434482>")
				.setStyle(ButtonStyle.Success)
				)
			} else {
				actionRow.addComponents( new ButtonBuilder()
				.setCustomId("nil")
				.setLabel("Abonniert zu: " + subscriptionDocument["class_id"] || "???")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
				)

				actionRow.addComponents( new ButtonBuilder()
				.setCustomId("infoscreen-unsubscribe")
				.setLabel("Kalender deabonnieren")
				.setEmoji("<:belloff:1283857394882969643>")
				.setStyle(ButtonStyle.Danger)
				)
			}

			// Create Feedback Button
			actionRow.addComponents( new ButtonBuilder()
			.setCustomId("form-feedback")
			.setEmoji("<:feedback:1283835932566491198>")
			.setLabel("Feeedback senden")
			.setStyle(ButtonStyle.Primary)
			)

			interaction.reply({
				ephemeral: true,
				components: [actionRow],
				content: "<:testingphase:1283449156794585138> **BETA** Feature"
			})
		}

		// Subscribe button
		if(args[1] === "subscribe") {
			const subscriptionCollection = db.collection("subscriptions")

			const subscriptionDocument = await subscriptionCollection.findOne({
				"user_id": interaction.user.id,
				"subscription_id": "infoscreen.notifications"
			})
			const isSubscribed = subscriptionDocument !== null

			// Check if already subscribed to avoid multiple documents
			if(isSubscribed) {
				interaction.reply({
					ephemeral: true,
					content: "Du hast bereits den Kalender abonniert."
				})
				
				return
			}

			// Set up modal
			const modal = new ModalBuilder()
			.setCustomId("infoscreen-subscription")
			.setTitle("Kalender abonnieren")

			// Add Class Input
			const classIdInput = new TextInputBuilder()
				.setCustomId("classId")
				.setLabel("Klassen ID")
				.setStyle(TextInputStyle.Short)
				.setRequired(true)
				.setPlaceholder("PD0924")
				.setMinLength(6)
				.setMaxLength(6)

			const classIdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(classIdInput)

			modal.addComponents(classIdActionRow)

			await interaction.showModal(modal)
		}

		// UNsubscribe button
		if(args[1] === "unsubscribe") {
			const subscriptionCollection = db.collection("subscriptions")

			const subscriptionDocument = await subscriptionCollection.findOne({
				"user_id": interaction.user.id,
				"subscription_id": "infoscreen.notifications"
			})
			const isSubscribed = subscriptionDocument !== null

			// Check if already subscribed to avoid multiple documents
			if(!isSubscribed) {
				interaction.reply({
					ephemeral: true,
					content: "Du hast bereits den Kalender deabonniert."
				})
				
				return
			}

			// Create test document
			subscriptionCollection.deleteOne({
				"user_id": interaction.user.id,
				"subscription_id": "infoscreen.notifications"
			})

			// Send confirmation
			interaction.reply({
				ephemeral: true,
				content: "Du hast den Kalender deabonniert."
			})
		}
	}
}