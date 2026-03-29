import { SlashCommandBuilder } from "discord.js";

export const registerCommandData = new SlashCommandBuilder()
  .setName("register")
  .setDescription("Link your Discord account to Albion Market Insights")
  .addStringOption((option) =>
    option
      .setName("token")
      .setDescription("Temporary token generated on the website")
      .setRequired(true),
  );

export const alertsCommandData = new SlashCommandBuilder()
  .setName("alerts")
  .setDescription("Manage your Albion Market Insights alerts")
  .addSubcommand((subcommand) =>
    subcommand.setName("list").setDescription("List active alerts"),
  );

export const commandData = [registerCommandData, alertsCommandData];
