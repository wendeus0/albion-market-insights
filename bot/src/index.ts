import { createBotClient, loginBot } from "./bot.js";
import { startAlertNotifier } from "./handlers/alertNotifier.js";

const client = createBotClient();
let notifier: ReturnType<typeof startAlertNotifier> | undefined;

client.once("ready", () => {
  notifier = startAlertNotifier(client);
});

process.on("SIGINT", () => {
  if (notifier) clearInterval(notifier);
  client.destroy();
  process.exit(0);
});

await loginBot(client);
