const { SlashCommandBuilder } = require("discord.js");
const voiceStateEvent = require("../events/voiceStateUpdate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Muestra el ranking semanal de voz"),
  
  async execute(interaction) {
    const voiceTimes = voiceStateEvent.voiceTimes || new Map();
    if (!voiceTimes.size) return interaction.reply("No hay actividad registrada esta semana.");

    const topUsers = [...voiceTimes.entries()]
      .sort((a,b) => (b[1].total || 0) - (a[1].total || 0))
      .slice(0, 10);

    let message = "**🏆 Top usuarios de voz (semanal):**\n";
    topUsers.forEach(([id, data], i) => {
      message += `**${i+1}.** <@${id}> - ${Math.round(data.total/60)} min\n`;
    });

    await interaction.reply(message);
  }
};
