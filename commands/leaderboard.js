// src/commands/leaderboard.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/initLevels");
const safeReply = require("../utils/safeReply");

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
        .setName("leaderboard")
        .setDescription("Muestra el top 10 de usuarios por puntaje total (mensajes + voz)"),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: false });

            db.all("SELECT * FROM users ORDER BY (xp + voice_time/30) DESC LIMIT 10", async (err, rows) => {
                if (err) return safeReply(interaction, "❌ Error al obtener el leaderboard.", true);

                const desc = rows.length > 0
                    ? rows.map((user, i) => {
                        const xpVoice = Math.floor((user.voice_time || 0)/30);
                        const totalXP = user.xp + xpVoice;
                        const levelRole = getLevelRole(user.level, interaction.guild);
                        const roleText = levelRole ? `<@&${levelRole.id}>` : "Ninguno";
                        return `**#${i+1}** - <@${user.user_id}>: XP Mensajes ${user.xp} + XP Voz ${xpVoice} = **${totalXP}** | Nivel: ${user.level} | Rol: ${roleText}`;
                    }).join("\n")
                    : "No hay datos aún.";

                const embed = new EmbedBuilder()
                    .setTitle("🏆 Leaderboard Usuarios Activos")
                    .setColor("Gold")
                    .setDescription(desc)
                    .setTimestamp();

                await safeReply(interaction, { embeds: [embed] });
            });
        } catch (err) {
            console.error("❌ Error leaderboard:", err);
            await safeReply(interaction, "❌ Ocurrió un error al mostrar el leaderboard.", true);
        }
    },
};
