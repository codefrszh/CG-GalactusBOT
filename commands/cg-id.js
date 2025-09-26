// src/commands/cg-id.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const voiceTimes = require("../utils/voiceTimes");
const { sendLog, safeReply } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cg-id")
    .setDescription("Muestra la información del usuario y sus estadísticas de voz")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Selecciona un usuario (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });

      const member = interaction.options.getMember("usuario") || interaction.member;
      const user = member.user;

      const data = voiceTimes.get(user.id) || { total: 0 };
      const sorted = [...voiceTimes.entries()]
        .sort((a, b) => (b[1].total || 0) - (a[1].total || 0));
      const position = sorted.findIndex(e => e[0] === user.id) + 1 || "N/A";

      const embed = new EmbedBuilder()
        .setTitle(`📊 Perfil de ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor("Blue")
        .addFields(
          { name: "👤 Usuario", value: `${user.tag}\nID: ${user.id}`, inline: true },
          { name: "📅 Cuenta creada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
          { name: "📥 Se unió al server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
          { name: "⏱️ Tiempo en voz", value: `${Math.round(data.total / 60)} min`, inline: true },
          { name: "🏆 Posición en leaderboard", value: `${position}`, inline: true },
          { name: "🏰 Servidor", value: `${interaction.guild.name}\nID: ${interaction.guild.id}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      sendLog(
        "Comando /cg-id",
        `Usuario <@${interaction.user.id}> ejecutó /cg-id para <@${user.id}>`,
        "Blue"
      );
    } catch (err) {
      console.error("❌ Error cg-id:", err);
      try { await interaction.editReply("❌ Ocurrió un error al mostrar la información."); } catch {}
    }
  }
};
