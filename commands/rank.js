const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database/initLevels");

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

            const embed = new EmbedBuilder()
                .setColor("#8b45ff")
                .setTitle(`Nivel de ${interaction.user.username}`)
                .setDescription(`📊 XP Total: **${row.xp}**\n⭐ Nivel: **${row.level}**`)
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        });
    },
};
