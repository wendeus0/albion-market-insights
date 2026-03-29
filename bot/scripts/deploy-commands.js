import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "../src/commands/index.js";
import { config } from "../src/config.js";
const rest = new REST({ version: "10" }).setToken(config.discord.token);
await rest.put(Routes.applicationCommands(config.discord.clientId), {
    body: commands.map((command) => command.data.toJSON()),
});
console.log("Discord commands deployed.");
