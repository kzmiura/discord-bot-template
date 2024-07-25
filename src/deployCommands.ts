import { readdirSync } from "node:fs";
import path from "node:path";

import {
  REST,
  RESTPatchAPIApplicationCommandJSONBody,
  Routes,
} from "discord.js";
import { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } from "./config";
import { Command } from "./types/command";

(async () => {
  const commands: RESTPatchAPIApplicationCommandJSONBody[] = [];

  // Load commands
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).map(
      (file) => path.parse(file).name,
    );
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command: Command = await import(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(
          `The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  // Deploy commands
  const rest = new REST().setToken(DISCORD_TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    if (!Array.isArray(data)) throw new TypeError("Response is not an array.");
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (e) {
    console.error(e);
  }
})();
