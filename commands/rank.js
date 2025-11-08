// src/commands/rank.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/initLevels");

// Función para obtener rol por nivel
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
        .setName("rank")
        .setDescription("Muestra tu nivel y XP"),

    async execute(interaction) {
        const userId = interaction.user.id;

        db.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
            if (err || !row) {
                return interaction.reply("Aún no tienes XP, ¡sé activo para ganar niveles!");
            }

            const nextLevelXP = row.level * 100;
            const progress = Math.min(100, Math.floor((row.xp / nextLevelXP) * 100));
            const levelRole = getLevelRole(row.level, interaction.guild);
            const roleText = levelRole ? `<@&${levelRole.id}>` : "Ninguno";

            const embed = new EmbedBuilder()
                .setColor("#8b45ff")
                .setTitle(`Nivel de ${interaction.user.username}`)
                .setDescription(`📊 XP Total: **${row.xp}**\n⭐ Nivel: **${row.level}**\n🎯 Progreso: ${progress}% hacia el nivel ${row.level + 1}\n🏷️ Rol actual: ${roleText}`)
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        });
    },
};
