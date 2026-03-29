import { supabase } from "@/lib/supabase";
import type { Alert, MarketItem } from "@/data/types";

export async function recordDiscordAlertTrigger(
  alertId: string,
): Promise<void> {
  const { error } = await supabase
    .from("alerts")
    .update({
      fired_at: new Date().toISOString(),
      notified_discord: false,
      notified_at: null,
    })
    .eq("id", alertId);

  if (error) throw new Error(error.message);
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  alert: Alert,
  item: MarketItem,
  currentPrice: number,
  priceChangePercent?: number,
): Promise<void> {
  const description =
    alert.condition === "change"
      ? `Price change: ${priceChangePercent?.toFixed(1) ?? "0.0"}%`
      : `Current price: ${currentPrice.toLocaleString()} in ${item.city}`;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Albion Market Insights",
      embeds: [
        {
          title: "Alert triggered",
          description,
          fields: [
            { name: "Item", value: item.itemName, inline: true },
            {
              name: "Condition",
              value: `${alert.condition} ${alert.threshold}`,
              inline: true,
            },
            { name: "UTC", value: new Date().toISOString(), inline: false },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Webhook HTTP ${response.status}`);
}
