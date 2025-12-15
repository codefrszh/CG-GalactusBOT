// src/commands/resetvoice.js
const { SlashCommandBuilder } = require("discord.js");
const { sendLog } = require("../utils/logger");
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetvoice")
    .setDescription("Resetea los tiempos de voz (solo admin)")
    .setDefaultMemberPermissions(0), // solo admin

  async execute(interaction, safeReply) {
    try {
      await interaction.deferReply({ ephemeral: true });

      voiceTimes.clear();

      await safeReply(interaction, "✅ Todos los tiempos de voz han sido reseteados.", true);

      sendLog(
        "Comando /resetvoice",
        `Usuario <@${interaction.user.id}> ejecutó /resetvoice`,
        "Blue"
      );
    } catch (err) {
      console.error("❌ Error resetvoice:", err);
      await safeReply(interaction, "❌ Ocurrió un error al resetear los tiempos.", true);
    }
  },
};
