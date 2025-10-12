// src/commands/ping.js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Comprueba la latencia del bot."),
  
  defer: false, // rápido, no necesita defer

  async execute(interaction) {
    try {
      await interaction.reply(`🏓 Pong! Latencia: ${Date.now() - interaction.createdTimestamp}ms`);
      return true;
    } catch (err) {
      console.error("❌ Error ping:", err);
      return false;
    }
  },
};
