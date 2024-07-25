import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { DISCORD_TOKEN } from "./config";
import { ClientEvent } from "./types/clientEvent";
import { Command } from "./types/command";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.commands = new Collection();

// Load commands
(async () => {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .map((file) => path.parse(file).name);

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command: Command = await import(filePath);

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(
          `The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }
})();

// Load events
(async () => {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .map((file) => path.parse(file).name);

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event: ClientEvent = await import(filePath);

    if (event.once) {
      client.once(event.name, event.execute);
    } else {
      client.on(event.name, event.execute);
    }
  }
})();

// Login
client.login(DISCORD_TOKEN);
