// src/commands/leaderboard.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { sendLog } = require("../utils/logger");
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Muestra el leaderboard completo de voz."),

  async execute(interaction, safeReply) {
    try {
      await interaction.deferReply({ ephemeral: false });

      const sorted = [...voiceTimes.entries()]
        .sort((a, b) => (b[1].total || 0) - (a[1].total || 0));

      const desc = sorted.length > 0
        ? sorted.map((entry, i) => `**#${i + 1}** - <@${entry[0]}>: ${Math.round(entry[1].total / 60)} min`).join("\n")
        : "No hay datos aún.";

      const embed = new EmbedBuilder()
        .setTitle("🏆 Leaderboard Voz")
        .setColor("Gold")
        .setTimestamp()
        .setDescription(desc);

      await safeReply(interaction, { embeds: [embed] });

      sendLog(
        "Comando /leaderboard",
        `Usuario <@${interaction.user.id}> ejecutó /leaderboard`,
        "Blue"
      );
    } catch (err) {
      console.error("❌ Error leaderboard:", err);
      await safeReply(interaction, "❌ Ocurrió un error al mostrar el leaderboard.", true);
    }
  },
};
