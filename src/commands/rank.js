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
        .setName("rank")
        .setDescription("Muestra tu nivel y XP"),

    async execute(interaction) {
        const userId = interaction.user.id;

        db.get("SELECT * FROM users WHERE user_id = ?", [userId], async (err, row) => {
            if (err || !row) return safeReply(interaction, "Aún no tienes XP, ¡sé activo para ganar niveles!");

            const voiceXP = Math.floor((row.voice_time || 0) / 30);
            const totalXP = row.xp + voiceXP;
            const level = row.level;
            const nextLevelXP = level * 100;
            const progress = Math.min(100, Math.floor((totalXP / nextLevelXP) * 100));
            const levelRole = getLevelRole(level, interaction.guild);
            const roleText = levelRole ? `<@&${levelRole.id}>` : "Ninguno";

            const embed = new EmbedBuilder()
                .setColor("#8b45ff")
                .setTitle(`Nivel de ${interaction.user.username}`)
                .setDescription(
                    `📊 XP Total: **${totalXP}**\n` +
                    `⭐ Nivel: **${level}**\n` +
                    `🎯 Progreso: ${progress}% hacia el nivel ${level + 1}\n` +
                    `🏷️ Rol actual: ${roleText}`
                )
                .setTimestamp();

            await safeReply(interaction, { embeds: [embed] });
        });
    },
};
