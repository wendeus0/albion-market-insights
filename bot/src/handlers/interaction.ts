import type { ChatInputCommandInteraction, Interaction } from "discord.js";
import { commands } from "../commands/index.js";
import { getMessages } from "../i18n.js";

const commandMap = new Map(
  commands.map((command) => [command.data.name, command]),
);

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction as ChatInputCommandInteraction);
  } catch (error) {
    const t = getMessages(interaction.locale);
    console.error(
      `Command execution failed: ${interaction.commandName}`,
      error,
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: t.interactionError });
      return;
    }

    await interaction.reply({ content: t.interactionError, ephemeral: true });
  }
}
