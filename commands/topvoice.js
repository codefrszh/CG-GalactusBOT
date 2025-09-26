// src/commands/topvoice.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const voiceTimes = require("../utils/voiceTimes");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topvoice")
    .setDescription("Muestra el ranking de tiempo en voz"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});

    const ranking = [];
    for (const [userId, data] of voiceTimes.entries()) {
      let total = data.total || 0;
      if (data.joinedAt) {
        total += Math.floor((Date.now() - data.joinedAt) / 1000);
      }
      ranking.push({ userId, total });
    }

    ranking.sort((a, b) => b.total - a.total);

    const top = ranking
      .slice(0, 10)
      .map((r, i) => `<@${r.userId}>: **${Math.floor(r.total / 60)} min**`)
      .join("\n") || "No hay datos aún.";

    const embed = new EmbedBuilder()
      .setTitle("🏆 Ranking Tiempo en Voz")
      .setDescription(top)
      .setColor("Gold");

    await interaction.editReply({ embeds: [embed] }).catch(() => {});
  },
};
