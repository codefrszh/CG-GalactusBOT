// commands/leaderboard.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getRanking } = require("../utils/leaderboardManager");
const { sendLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Muestra el ranking semanal de voz"),
  async execute(interaction) {
    try {
      const ranking = getRanking();
      if (ranking.length === 0) return interaction.reply("No hay actividad de voz aún esta semana.");

      const embed = new EmbedBuilder()
        .setTitle("🏆 Leaderboard Semanal de Voz")
        .setColor("Gold")
        .setTimestamp()
        .setDescription(ranking
          .slice(0,10)
          .map((entry,i)=>`**#${i+1}** - <@${entry.userId}>: ${Math.round(entry.total/60)} min`)
          .join("\n")
        );

      await interaction.reply({ embeds: [embed] });
      sendLog("Leaderboard Ejecutado", `Usuario <@${interaction.user.id}> consultó el leaderboard`, "Blue");
    } catch (err) {
      console.error("❌ Error leaderboard:", err);
      sendLog("Error Leaderboard", `${err}`, "Red");
    }
  }
};
