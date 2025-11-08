// src/commands/topvoice.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/initLevels");
const { sendLog } = require("../utils/logger");

// Función para obtener rol por nivel
function getLevelRole(level, guild) {
  const roles = {
    5: "1436449769286402191",   // Tripulante
    10: "1436449687384363120",  // Rango Bronze
    20: "1436449720405983402",  // Rango Plata
    50: "1436449741234567890",  // Rango Oro
    100: "1436449630362800229", // Rango Diamante
  };
  return guild.roles.cache.get(roles[level]) || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topvoice")
    .setDescription("Muestra los top 3 usuarios con más actividad (mensajes + voz)"),

  async execute(interaction, safeReply) {
    try {
      await interaction.deferReply({ ephemeral: false });

      db.all("SELECT * FROM users ORDER BY (xp + voice_time/30) DESC LIMIT 3", async (err, rows) => {
        if (err) {
          console.error("DB error /topvoice:", err);
          return await safeReply(interaction, "❌ Error al obtener el top de usuarios.", true);
        }

        const desc = rows.length > 0
          ? rows.map((user, i) => {
              const xpVoice = Math.floor((user.voice_time||0)/30);
              const totalXP = user.xp + xpVoice;
              const levelRole = getLevelRole(user.level, interaction.guild);
              const roleText = levelRole ? `<@&${levelRole.id}>` : "Ninguno";
              return `**#${i + 1}** - <@${user.user_id}>: XP Mensajes ${user.xp} + XP Voz ${xpVoice} = **${totalXP}** | Nivel: ${user.level} | Rol: ${roleText}`;
            }).join("\n")
          : "No hay datos aún.";

        const embed = new EmbedBuilder()
          .setTitle("🎤 Top Usuarios Activos")
          .setColor("Purple")
          .setTimestamp()
          .setDescription(desc);

        await safeReply(interaction, { embeds: [embed] });

        sendLog(
          "Comando /topvoice",
          `Usuario <@${interaction.user.id}> ejecutó /topvoice`,
          "Blue"
        );
      });

    } catch (err) {
      console.error("❌ Error topvoice:", err);
      await safeReply(interaction, "❌ Ocurrió un error al mostrar el top voice.", true);
    }
  },
};
