// commands/topvoice.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const voiceStateEvent = require("../events/voiceStateUpdate");

// commands/topvoice.js
const { sendLog } = require("../utils/logger");

// Simulación de top voice activity
const topVoiceData = [
  { user: "Usuario1", hours: 12 },
  { user: "Usuario2", hours: 9 },
  { user: "Usuario3", hours: 7 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topvoice")
    .setDescription("Muestra los usuarios más activos en canales de voz."),
  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("🎤 Top Voice Activity")
        .setColor("Purple")
        .setTimestamp()
        .setDescription(
          topVoiceData
            .map((entry, i) => `**#${i + 1}** - ${entry.user}: ${entry.hours} horas`)
            .join("\n")
        );

      await interaction.reply({ embeds: [embed] });
      sendLog("TopVoice Ejecutado", `Usuario <@${interaction.user.id}> consultó top voice`, "Blue");
    } catch (err) {
      console.error("❌ Error topvoice:", err);
      sendLog("Error TopVoice", `${err}`, "Red");
    }
  },
};
