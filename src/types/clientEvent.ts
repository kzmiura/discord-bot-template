import { ClientEvents } from "discord.js";

export interface ClientEvent {
  name: keyof ClientEvents;
  once: boolean;
  execute: (...args: []) => void;
}
