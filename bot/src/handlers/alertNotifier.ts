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

const MAX_DELIVERY_RETRIES = 3;
const deliveryFailures = new Map<string, number>();

interface AlertProfileRow {
  discord_id: string | null;
  discord_dm_enabled: boolean;
  discord_locale: string | null;
}

interface PendingAlertRow {
  id: string;
  user_id: string;
  item_name: string;
  city: string;
  condition: string;
  threshold: number;
  fired_at: string;
  profiles: AlertProfileRow | AlertProfileRow[] | null;
}

async function markAlertAsNotified(alertId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("alerts")
    .update({
      notified_discord: true,
      notified_at: new Date().toISOString(),
    })
    .eq("id", alertId);

  if (error) {
    throw new Error(error.message);
  }
}

export function startAlertNotifier(client: Client) {
  return setInterval(async () => {
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from("alerts")
      .select(
        "id, user_id, item_name, city, condition, threshold, fired_at, profiles!inner(discord_id, discord_dm_enabled, discord_locale)",
      )
      .not("fired_at", "is", null)
      .eq("notified_discord", false)
      .eq("profiles.discord_dm_enabled", true)
      .not("profiles.discord_id", "is", null)
      .limit(20);

    if (alertsError) {
      console.error("Failed to fetch pending Discord alerts", alertsError);
      return;
    }

    for (const alert of (alerts ?? []) as PendingAlertRow[]) {
      const profile = Array.isArray(alert.profiles)
        ? alert.profiles[0]
        : alert.profiles;

      if (!profile?.discord_id) {
        continue;
      }

      let dmSent = false;

      try {
        const user = await client.users.fetch(profile.discord_id);
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
        dmSent = true;
        await markAlertAsNotified(alert.id);
        deliveryFailures.delete(alert.id);
      } catch (error) {
        console.error(`Failed to deliver Discord alert ${alert.id}`, error);

        if (dmSent) {
          try {
            await markAlertAsNotified(alert.id);
            deliveryFailures.delete(alert.id);
          } catch (markError) {
            console.error(
              `Failed to mark delivered alert ${alert.id} as notified`,
              markError,
            );
          }
          continue;
        }

        const retries = (deliveryFailures.get(alert.id) ?? 0) + 1;
        deliveryFailures.set(alert.id, retries);

        if (retries < MAX_DELIVERY_RETRIES) {
          continue;
        }

        try {
          await markAlertAsNotified(alert.id);
          deliveryFailures.delete(alert.id);
        } catch (markError) {
          console.error(
            `Failed to close alert ${alert.id} after retries`,
            markError,
          );
        }
      }
    }
  }, config.pollIntervalMs);
}
