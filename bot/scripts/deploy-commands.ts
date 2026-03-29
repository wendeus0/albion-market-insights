import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commandData } from "../src/commands/definitions.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID");
}

const rest = new REST({ version: "10" }).setToken(token);

await rest.put(Routes.applicationCommands(clientId), {
  body: commandData.map((command) => command.toJSON()),
});

console.log("Discord commands deployed.");
