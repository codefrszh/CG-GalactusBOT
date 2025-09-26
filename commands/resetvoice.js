// src/commands/resetvoice.js
const { SlashCommandBuilder } = require("discord.js");
const { sendLog } = require("../utils/logger");
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetvoice")
    .setDescription("Resetea los tiempos de voz (admin)")
    .setDefaultMemberPermissions(0), // sólo admin

  async execute(interaction) {
    try {
      // defer para evitar InteractionAlreadyReplied
      await interaction.deferReply({ ephemeral: true });

      // Limpia todos los registros
      voiceTimes.clear();

      await interaction.editReply("✅ Todos los tiempos de voz han sido reseteados.");
      sendLog(
        "Comando /resetvoice",
        `Usuario <@${interaction.user.id}> ejecutó /resetvoice`,
        "Blue"
      );
    } catch (err) {
      console.error("❌ Error resetvoice:", err);
      try {
        await interaction.editReply("❌ Ocurrió un error al resetear los tiempos.");
      } catch (_) {}
    }
  },
};
