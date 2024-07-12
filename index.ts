import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { Command, Event } from "./types";
import { configDotenv } from "dotenv";

configDotenv();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

client.commands = new Collection();

// Load commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).map(file => path.parse(file).name);
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        import(filePath).then((command: Command) => {
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        });
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).map(file => path.parse(file).name);
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    import(filePath).then((event: Event) => {
        if (event.once) {
            client.once(event.name, event.execute);
        } else {
            client.on(event.name, event.execute);
        }
    });
}

// Login
client.login();
