import { Channel, Client, Embed, EmbedBuilder, Events, Message, TextChannel } from "discord.js";
import { db } from "../../bot";
import * as cheerio from "cheerio";
import axios from "axios";
import * as schedule from 'node-schedule';

module.exports = {
	once: false,
	name: Events.ClientReady,

	async execute(client: Client) {
		const MESSAGE_TYPE = "main.infoscreen";
		const CHANNEL_ID = "1280799818134061089";
		const GUILD_ID = "1280797866591522839";
		const CHANNEL = client.guilds.cache.get(GUILD_ID)?.channels.cache.get(CHANNEL_ID) as TextChannel | undefined;

		const COLLECTION = db.collection("messages_permanent");

		// Always called when new message is sent
		async function getMessage() {
			// Check if message exists
			let messagePromise = new Promise<string | null>(async (resolve, reject) => {
				let document = await COLLECTION.findOne({
					"message_type": MESSAGE_TYPE
				});

				// Check if message was created before
				if (!document) {
					reject(new Error("Document not found"));
					return;
				}

				// Fetch message
				let sentMessage: Message | undefined;
				try {
					sentMessage = await CHANNEL?.messages.fetch(document["message_id"]);
				} catch (error) {
					sentMessage = undefined;
				}

				// Check if message deleted
				if (!sentMessage) {
					reject(new Error("Message deleted"));
					return;
				}

				resolve(document["message_id"]);
			});

			let displayedMessage: Message | undefined = await messagePromise.then(async (messageId) => {
				if (!messageId) return undefined;

				let sentMessage: Message | undefined;
				try {
					sentMessage = await CHANNEL?.messages.fetch(messageId);
				} catch (error) {
					sentMessage = undefined;
				}
				return sentMessage;
			}).catch(async (error: Error) => {
				// Create new message since message not created or deleted
				let sentMessage = await CHANNEL?.send({ content: "Preparing content..." });

				if(!sentMessage) {
					console.log("❌ Could not send permanent message", MESSAGE_TYPE);
					return;
				}

				// Save message to DB
				await COLLECTION.updateOne(
					{ "message_type": MESSAGE_TYPE },
					{
						$set: {
							"message_type": MESSAGE_TYPE,
							"message_id": sentMessage.id
						}
					},
					{ upsert: true }
				);

				return sentMessage;
			});

			return displayedMessage
		}

		// This func will be called at program start and after that every day at 6AM
		async function sendMessage() {
			let message = await getMessage()

			if(!message) {
				console.log("❌ Could not update info screen.");
				return;
			}

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

			// Prepare a new embed list where we'll put our embeds to send
			let embeds: EmbedBuilder[] = []

			// Add Intro Embed
			let introEmbed = new EmbedBuilder()
			.setTitle("Anstehende Termine")
			.setDescription(`
- Webscraped aus dem [Infoscreen](https://infoscreen.sae.ch).
- Zeigt nur anstehende Termine an
- Manche Termine haben einen Zoom Link angeheftet. Dies kann an der Kamera links vom Termin Namen erkannt werden. (<:videooff:1281582613986807830> & <:video:1281582600754040893>)`
)
			.setColor("White")

			embeds.push(introEmbed)
	
			// Parse
			const selector = cheerio.load(rawInfoScreen);
			const boxes = selector(".unterrichtsBox")
			boxes.each( (i, box) => {
				const classId = selector(box).find(".unterrichtsBox_Klasse").text()
				const timeAndLocation = selector(box).find(".unterrichtsBox_Uhrzeit").text()
				const subjectAndLecturer = selector(box).find(".unterrichtsBox_UnterrichtUndDozent").text()
				const iconUrl = selector(box).find(".unterrichtsBox_Symbol>img").attr("src")
				const parent = selector(box).parent()

				// Create a signle embed for everything if there are more than 9 events today
				if(boxes.length >= 10) {
					introEmbed.addFields({
						"name": classId,
						"value": subjectAndLecturer + " - **" + timeAndLocation + "**"
					})

					return;
				}
				
				// Create embed
				let embed = new EmbedBuilder()
				.setAuthor({
					name: classId && "Kein Klassenname",
					iconURL: "https://infoscreen.sae.ch/" + iconUrl
				})
				.setDescription(timeAndLocation)
				.setColor("LightGrey")

				// Add Zoom link if there is one
				if(parent.is("a") ) {
					const href = parent.attr("href")
					
					if(href !== undefined) {
						embed.setURL(href)
						embed.setTitle( "<:video:1281582600754040893> - " + subjectAndLecturer )
					}
				} else {
					embed.setTitle( "<:videooff:1281582613986807830> - " + subjectAndLecturer )
				}

				// Add to final array
				embeds.push(embed)
			} )

			// Show embed if there are no appoiments
			if(boxes.length === 0) {
				let replacementEmbed = new EmbedBuilder()
					.setTitle("Kalender Leer")
					.setDescription("Heute gibt es keine anstehenden Termine.")
					.setColor("White")

				embeds.push(replacementEmbed)
			}

			// Show embed if there are too many events
			if(boxes.length >= 10) {
				let replacementEmbed = new EmbedBuilder()
					.setTitle("Zu viele Events")
					.setDescription("Heute gibt es zu viele anstehenden Termine. Klassen Icons & Zoom Links können nur auf der Website nachgesehen werden.")
					.setColor("Yellow")

				embeds.push(replacementEmbed)
			}
			
			// Add contribute Footer
			let lastEmbed = embeds.at(-1)
			lastEmbed?.setTimestamp()
			lastEmbed?.setFooter({
				"text": "Letztes Update"
			})

			// Edit the message with all embeds
			message.edit({
				content: "",
				embeds: embeds
			})
		}

		sendMessage()
		
		// Cron job for sending the message every hour
		const cronJob = schedule.scheduleJob('0 * * * *', sendMessage);
	}
};
