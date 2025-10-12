// src/commands/topvoice.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sendLog } = require("../utils/logger");
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topvoice")
    .setDescription("Muestra los top 3 usuarios en voz."),

  async execute(interaction, safeReply) {
    try {
      await interaction.deferReply({ ephemeral: false });

      const topUsers = [...voiceTimes.entries()]
        .sort((a, b) => (b[1].total || 0) - (a[1].total || 0))
        .slice(0, 3);

      const embed = new EmbedBuilder()
        .setTitle("🎤 Top Voz Semanal")
        .setColor("Purple")
        .setTimestamp()
        .setDescription(
          topUsers.length > 0
            ? topUsers.map((entry, i) => `**#${i + 1}** - <@${entry[0]}>: ${Math.round(entry[1].total / 60)} min`).join("\n")
            : "No hay datos aún."
        );

      await safeReply(interaction, { embeds: [embed] });

      sendLog(
        "Comando /topvoice",
        `Usuario <@${interaction.user.id}> ejecutó /topvoice`,
        "Blue"
      );
    } catch (err) {
      console.error("❌ Error topvoice:", err);
      await safeReply(interaction, "❌ Ocurrió un error al mostrar el top voice.", true);
    }
  },
};
