import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { supabaseAdmin } from "../supabase.js";
import { getMessages } from "../i18n.js";

export const alertsCommand = {
  data: new SlashCommandBuilder()
    .setName("alerts")
    .setDescription("Manage your Albion Market Insights alerts")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List active alerts"),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const t = getMessages(interaction.locale);

    if (subcommand !== "list") return;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("discord_id", interaction.user.id)
      .maybeSingle();

    if (!profile) {
      await interaction.reply({ content: t.registerInvalid, ephemeral: true });
      return;
    }

    const { data: alerts, error } = await supabaseAdmin
      .from("alerts")
      .select("item_name, city, condition, threshold, is_active")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !alerts || alerts.length === 0) {
      await interaction.reply({ content: t.alertsEmpty, ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder().setTitle(t.alertsTitle).setColor(0x2b8a3e);

    for (const alert of alerts.slice(0, 10)) {
      embed.addFields({
        name: alert.item_name as string,
        value: `${alert.condition} ${alert.threshold} - ${alert.city}`,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
