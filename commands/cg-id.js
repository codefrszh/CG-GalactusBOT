// src/commands/cg-id.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/initLevels");
const { sendLog } = require("../utils/logger");

function getLevelRole(level, guild) {
    const roles = {
        5: "1436449769286402191",
        10: "1436449687384363120",
        20: "1436449720405983402",
        50: "1436449741234567890",
        100: "1436449630362800229",
    };
    return guild.roles.cache.get(roles[level]) || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cg-id")
    .setDescription("Muestra la información del usuario y sus estadísticas")
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

      db.get("SELECT * FROM users WHERE user_id = ?", [user.id], (err, row) => {
        if (err) return interaction.editReply("❌ Error al obtener los datos de usuario.");
        const xp = row?.xp || 0;
        const level = row?.level || 1;
        const voiceXP = Math.floor((row?.voice_time || 0)/30);
        const totalXP = xp + voiceXP;
        const nextLevelXP = level * 100;
        const progress = Math.min(100, Math.floor((totalXP / nextLevelXP) * 100));
        const levelRole = getLevelRole(level, interaction.guild);
        const roleText = levelRole ? `<@&${levelRole.id}>` : "Ninguno";

        const embed = new EmbedBuilder()
          .setTitle(`🌌 CG ID: ${user.username}`)
          .setDescription("✨ Información estelar")
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setColor("#1E1B5F")
          .setFooter({ text: "🌠 Comunidad Galactica" })
          .addFields(
            { name: "👤 Usuario", value: `${user.tag}\n🆔 ${user.id}`, inline: true },
            { name: "📅 Cuenta creada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
            { name: "📥 Se unió al server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
            { name: "⏱️ Tiempo en voz", value: `${voiceXP} XP`, inline: true },
            { name: "📊 XP Mensajes", value: `${xp} XP`, inline: true },
            { name: "⭐ Nivel", value: `${level}`, inline: true },
            { name: "🎯 Progreso al siguiente nivel", value: `${progress}%`, inline: true },
            { name: "🏷️ Rol actual", value: roleText, inline: true },
            { name: "🏰 Servidor", value: `${interaction.guild.name}\n🆔 ${interaction.guild.id}`, inline: true }
          )
          .setTimestamp();

        interaction.editReply({ embeds: [embed] });
      });

      sendLog(
        "Comando /cg-id",
        `Usuario <@${interaction.user.id}> ejecutó /cg-id para <@${member.user.id}>`,
        "Blue"
      );

    } catch (err) {
      console.error("❌ Error cg-id:", err);
      try { await interaction.editReply("❌ Ocurrió un error al mostrar la información."); } catch {}
    }
  }
};
