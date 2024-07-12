import { ChatInputCommandInteraction, ClientEvents, Collection, SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export interface Event {
    name: keyof ClientEvents;
    once: boolean;
    execute: (...args: []) => void;
};

declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
    }
}
