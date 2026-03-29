import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { supabaseAdmin } from "../supabase.js";
import { getMessages } from "../i18n.js";

export const registerCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Link your Discord account to Albion Market Insights")
    .addStringOption((option) =>
      option
        .setName("token")
        .setDescription("Temporary token generated on the website")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const token = interaction.options
      .getString("token", true)
      .trim()
      .toUpperCase();
    const t = getMessages(interaction.locale);

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, discord_link_expires_at")
      .eq("discord_link_token", token)
      .maybeSingle();

    const expired =
      !profile?.discord_link_expires_at ||
      new Date(profile.discord_link_expires_at).getTime() < Date.now();

    if (error || !profile || expired) {
      await interaction.reply({ content: t.registerInvalid, ephemeral: true });
      return;
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        discord_id: interaction.user.id,
        discord_username: interaction.user.username,
        discord_locale: interaction.locale,
        discord_dm_enabled: true,
        discord_link_token: null,
        discord_link_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      await interaction.reply({ content: t.registerError, ephemeral: true });
      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription(t.registerSuccess).setColor(0x5865f2),
      ],
      ephemeral: true,
    });
  },
};
