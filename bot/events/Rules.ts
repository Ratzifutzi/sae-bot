import { Channel, Client, EmbedBuilder, Events, Message, TextChannel } from "discord.js";
import { db } from "../../bot";

module.exports = {
	once: false,
	name: Events.ClientReady,

	async execute(client: Client) {
		const MESSAGE_TYPE = "main.rules";
		const CHANNEL_ID = "1280813479804141630";
		const GUILD_ID = "1280797866591522839";
		const CHANNEL = client.guilds.cache.get(GUILD_ID)?.channels.cache.get(CHANNEL_ID) as TextChannel | undefined;
		const EMBED = new EmbedBuilder()
			.setTitle("SAE Community Server 2024")
			.setColor("White")
			.setDescription("Seit keine Bananen.")
		const MESSAGE = { embeds: [EMBED], content: "" };

		const COLLECTION = db.collection("messages_permanent");

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

			// Save message to DB
			if (sentMessage) {
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
			}

			return sentMessage;
		});

		// Edit the message to show newest content
		if(!displayedMessage) {
			console.log("❌ There was an error loading permanent message", MESSAGE_TYPE)
			return
		}

		displayedMessage.edit(MESSAGE)
	}
};
