import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { supabaseAdmin } from "../supabase.js";
import { getMessages } from "../i18n.js";
import { alertsCommandData } from "./definitions.js";

export const alertsCommand = {
  data: alertsCommandData,
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const t = getMessages(interaction.locale);

    if (subcommand !== "list") return;

    await interaction.deferReply({ ephemeral: true });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("discord_id", interaction.user.id)
      .maybeSingle();

    if (profileError) {
      await interaction.editReply({ content: t.alertsError });
      return;
    }

    if (!profile) {
      await interaction.editReply({ content: t.registerRequired });
      return;
    }

    const { data: alerts, error } = await supabaseAdmin
      .from("alerts")
      .select("item_name, city, condition, threshold, is_active")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      await interaction.editReply({ content: t.alertsError });
      return;
    }

    if (!alerts || alerts.length === 0) {
      await interaction.editReply({ content: t.alertsEmpty });
      return;
    }

    const embed = new EmbedBuilder().setTitle(t.alertsTitle).setColor(0x2b8a3e);

    for (const alert of alerts.slice(0, 10)) {
      embed.addFields({
        name: alert.item_name as string,
        value: `${alert.condition} ${alert.threshold} - ${alert.city}`,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
