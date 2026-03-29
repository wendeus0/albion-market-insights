import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Client,
} from "discord.js";
import { config } from "../config.js";
import { getMessages } from "../i18n.js";
import { supabaseAdmin } from "../supabase.js";

interface PendingAlertRow {
  id: string;
  user_id: string;
  item_name: string;
  city: string;
  condition: string;
  threshold: number;
  fired_at: string;
}

export function startAlertNotifier(client: Client) {
  return setInterval(async () => {
    const { data: alerts } = await supabaseAdmin
      .from("alerts")
      .select("id, user_id, item_name, city, condition, threshold, fired_at")
      .not("fired_at", "is", null)
      .eq("notified_discord", false)
      .limit(20);

    for (const alert of (alerts ?? []) as PendingAlertRow[]) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("discord_id, discord_dm_enabled, discord_locale")
        .eq("id", alert.user_id)
        .maybeSingle();

      if (!profile?.discord_id || !profile.discord_dm_enabled) continue;

      try {
        const user = await client.users.fetch(profile.discord_id as string);
        const t = getMessages(profile.discord_locale as string | null);
        const embed = new EmbedBuilder()
          .setTitle(t.alertTriggered)
          .setColor(0xff922b)
          .addFields(
            { name: "Item", value: alert.item_name, inline: true },
            {
              name: "Condition",
              value: `${alert.condition} ${alert.threshold}`,
              inline: true,
            },
            { name: "City", value: alert.city, inline: true },
            {
              name: "UTC",
              value: new Date(alert.fired_at).toISOString(),
              inline: false,
            },
          );

        const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(t.manageAlerts)
            .setStyle(ButtonStyle.Link)
            .setURL(`${config.appBaseUrl}/alerts`),
          new ButtonBuilder()
            .setLabel(t.dashboard)
            .setStyle(ButtonStyle.Link)
            .setURL(`${config.appBaseUrl}/dashboard`),
        );

        await user.send({ embeds: [embed], components: [actions] });

        await supabaseAdmin
          .from("alerts")
          .update({
            notified_discord: true,
            notified_at: new Date().toISOString(),
          })
          .eq("id", alert.id);
      } catch {
        continue;
      }
    }
  }, config.pollIntervalMs);
}
