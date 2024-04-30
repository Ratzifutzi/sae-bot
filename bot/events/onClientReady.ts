import { Client, Events } from "discord.js";
import { db } from "../../bot";

module.exports = {
    once: true,
    name: Events.ClientReady,
    
    async execute( client: Client ) {
        console.log(`☑️  Logged in as ${ client.user?.tag }`);
    }
}