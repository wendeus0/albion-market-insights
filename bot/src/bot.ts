import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config.js";
import { handleInteraction } from "./handlers/interaction.js";

export function createBotClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel],
  });

  client.on("interactionCreate", handleInteraction);

  return client;
}

export async function loginBot(client: Client) {
  await client.login(config.discord.token);
}
