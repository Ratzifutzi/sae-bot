"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const manager = new discord_js_1.ShardingManager("./bot.js", {
    token: process.env.BOT_TOKEN,
});
manager.on('shardCreate', shard => console.log(`🚀 Launched shard ${shard.id}`));
manager.spawn();
///////////////////
// Clean Up Code //
///////////////////
function emitExit(signal) {
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
process.on('exit', (code) => {
    console.log(`\nPROCESS EXITED WITH CODE ${code}`);
});
///////////////////
// Clean Up Code //
///////////////////
