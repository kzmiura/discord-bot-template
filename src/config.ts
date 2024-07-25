import { configDotenv } from "dotenv";

configDotenv();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
export const CLIENT_ID = process.env.CLIENT_ID!;
export const GUILD_ID = process.env.GUILD_ID!;
