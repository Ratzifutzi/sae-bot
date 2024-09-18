import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, Client, Embed, EmbedBuilder, Events, Guild, Message, TextChannel } from "discord.js";
import { db } from "../../../bot";
import * as cheerio from "cheerio";
import axios from "axios";
import * as schedule from 'node-schedule';
import { configuration } from "../../../config";

module.exports = {
	once: false,
	name: Events.ClientReady,

	async execute(client: Client) {
		const subscriptionCollection = db.collection("subscriptions")
		const GUILD_ID = configuration.GUILD_ID;
		const GUILD = client.guilds.cache.get(GUILD_ID)

		// This will be called every day at 7AM
		async function sendMessage() {
			// Extract info from the raw HTML
			const rawInfoScreen: string | undefined = await axios.get("https://infoscreen.sae.ch/").then((result) => {
				return result.data
			}).catch((error) => {
				return undefined
			})

			// Protection
			if (!rawInfoScreen) {
				console.log("❌ Could not fetch infoscreen from sae.ch");
				return;
			}

			// Parse
			const selector = cheerio.load(rawInfoScreen);
			const boxes = selector(".unterrichtsBox")
			boxes.each(async (i, box) => {
				const classId = selector(box).find(".unterrichtsBox_Klasse").text() || ""
				const timeAndLocation = selector(box).find(".unterrichtsBox_Uhrzeit").text() || "??:?? - ????"
				const subjectAndLecturer = selector(box).find(".unterrichtsBox_UnterrichtUndDozent").text() || "???"
				const iconUrl = selector(box).find(".unterrichtsBox_Symbol>img").attr("src") || ""

				// Get everyone that subscribed to that class
				const subscriptions = await subscriptionCollection.find({
					"class_id": classId
				}).toArray()

				// Send message to all subscribers
				subscriptions.forEach(async (element) => {
					const userId = element["user_id"]

					// Check if user is in the guild
					let member;
					try {
						member = await GUILD?.members.fetch(userId)
					} catch (error) {
						member = undefined
					}
					if (!member) return;

					// Send message
					try {
						member.send({
							embeds: [new EmbedBuilder()
								.setTitle("Guten Morgen")
								.setDescription(`
Du erhälst diese Nachricht, da du den Infoscreen abonniert hast.

Heute hast du folgenden Termin:
**${subjectAndLecturer}**
**${timeAndLocation}**`)
								.setColor("LightGrey")
							]
						})
					} catch (error) {
						console.log("❌ Could not send message to user " + member.displayName + ". Probably because DMs are closed.");
					}
				})
			})
		}

		// Cron job for sending the messages at 7AM
		schedule.scheduleJob('0 07 * * *', sendMessage);
	}
};
