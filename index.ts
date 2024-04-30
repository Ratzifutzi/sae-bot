import { ShardingManager } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const manager = new ShardingManager("./bot.js", {
    token: process.env.BOT_TOKEN,
})

manager.on('shardCreate', shard => console.log(`🚀 Launched shard ${shard.id}`));

manager.spawn();

///////////////////
// Clean Up Code //
///////////////////
function emitExit(signal: string) {
    process.exit(0);
}

// Catches Ctrl + C events
process.on('SIGINT', () => emitExit('SIGINT'));

// Catches "kill pid" events (for example: nodemon restarts)
process.on('SIGUSR1', () => emitExit('SIGUSR1'));
process.on('SIGUSR2', () => emitExit('SIGUSR2'));

// Catches unhandled errors
process.on('uncaughtException', error => {
    console.log('Unhandled error.', error);
    process.exit(1);
});

// Catches unhandled Promise rejections
process.on('unhandledRejection', error => {
    console.log('Unhandled Promise rejection.', error);
    process.exit(1);
});

// `process.exit` callback
process.on('exit', (code: number) => {
    console.log(`\nPROCESS EXITED WITH CODE ${code}`);
    
});

///////////////////
// Clean Up Code //
///////////////////