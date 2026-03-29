import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID");
}

const commands = [
  new SlashCommandBuilder()
    .setName("register")
    .setDescription("Link your Discord account to Albion Market Insights")
    .addStringOption((option) =>
      option
        .setName("token")
        .setDescription("Temporary token generated on the website")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("alerts")
    .setDescription("Manage your Albion Market Insights alerts")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List active alerts"),
    ),
];

const rest = new REST({ version: "10" }).setToken(token);

await rest.put(Routes.applicationCommands(clientId), {
  body: commands.map((command) => command.toJSON()),
});

console.log("Discord commands deployed.");
