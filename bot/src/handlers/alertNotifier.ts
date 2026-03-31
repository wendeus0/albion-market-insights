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
  id: string;
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

async function fetchPendingAlerts(): Promise<PendingAlertRow[]> {
  const { data, error } = await supabaseAdmin
    .from("alerts")
    .select("id, user_id, item_name, city, condition, threshold, fired_at")
    .not("fired_at", "is", null)
    .eq("notified_discord", false)
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PendingAlertRow[];
}

async function fetchDiscordProfiles(
  userIds: string[],
): Promise<Map<string, AlertProfileRow>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, discord_id, discord_dm_enabled, discord_locale")
    .in("id", userIds)
    .eq("discord_dm_enabled", true)
    .not("discord_id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    ((data ?? []) as AlertProfileRow[]).map((profile) => [profile.id, profile]),
  );
}

export function startAlertNotifier(client: Client) {
  return setInterval(async () => {
    let alerts: PendingAlertRow[];

    try {
      alerts = await fetchPendingAlerts();
    } catch (error) {
      console.error("Failed to fetch pending Discord alerts", error);
      return;
    }

    const userIds = [...new Set(alerts.map((alert) => alert.user_id))];
    let profilesByUserId: Map<string, AlertProfileRow>;

    try {
      profilesByUserId = await fetchDiscordProfiles(userIds);
    } catch (error) {
      console.error("Failed to fetch Discord profiles", error);
      return;
    }

    for (const alert of alerts) {
      const profile = profilesByUserId.get(alert.user_id);

      if (!profile?.discord_id) {
        continue;
      }

      let dmSent = false;

      try {
        const user = await client.users.fetch(profile.discord_id);
        const t = getMessages(profile.discord_locale);
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
