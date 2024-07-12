import { readdirSync } from "node:fs";
import path from "node:path";
import { Command } from "./types";
import { REST, RESTPatchAPIApplicationCommandJSONBody, Routes } from "discord.js";
import { configDotenv } from "dotenv";

configDotenv();

const commands: RESTPatchAPIApplicationCommandJSONBody[] = [];

(async () => {
    // Load commands
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).map(file => path.parse(file).name);
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command: Command = await import(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    // Deploy commands
    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: commands },
        );
        
        console.log(`Successfully reloaded ${(data as []).length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
