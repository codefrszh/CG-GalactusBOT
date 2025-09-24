// src/commands/resetvoice.js
const { SlashCommandBuilder } = require("discord.js");
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetvoice")
    .setDescription("Reinicia el conteo de tiempo de voz semanal."),

  defer: true,

  async execute(interaction) {
    try {
      voiceTimes.clear();
      await interaction.editReply("✅ Conteo de voz semanal reiniciado.");
      return true;
    } catch (err) {
      console.error("❌ Error resetvoice:", err);
      return false;
    }
  },
};
