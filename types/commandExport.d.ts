import { SlashCommandBuilder } from "discord.js"

export type BotCommandExportSettings = {
    cooldown: ?number
}

export type botCommandExport = {
    data: SlashCommandBuilder,
    settings?: BotCommandExportSettings,
    execute: Function
}