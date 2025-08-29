const { SlashCommandBuilder } = require("discord.js");
const { sendLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde con Pong!"),
  async execute(interaction) {
    await interaction.reply("🏓 Pong!");
  }
};
