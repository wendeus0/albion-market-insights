import type { ChatInputCommandInteraction, Interaction } from "discord.js";
import { commands } from "../commands/index.js";

const commandMap = new Map(
  commands.map((command) => [command.data.name, command]),
);

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  await command.execute(interaction as ChatInputCommandInteraction);
}
