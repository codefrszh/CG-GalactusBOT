// src/commands/botnews.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botnews")
    .setDescription("Muestra los últimos cambios y novedades del bot."),

  async execute(interaction) {
    const leaderboardInfoEmbed = new EmbedBuilder()
      .setTitle("🎤 Nuevo Leaderboard de Voz")
      .setDescription(
        "¡Atención comunidad! Hemos actualizado nuestro sistema de ranking de usuarios activos en voz para reconocer a los más participativos."
      )
      .setColor("Purple")
      .addFields(
        { name: "💡 Qué hace", value: "• Registra automáticamente el tiempo que cada usuario pasa en canales de voz.\n• Destaca los 3 primeros lugares de la semana con `/topvoice`.\n• Muestra el ranking completo con `/leaderboard`." },
        { name: "🎯 Beneficios", value: "• Reconocimiento a los miembros más activos.\n• Motivación para interactuar y participar en la comunidad.\n• Datos precisos y actualizados automáticamente." },
        { name: "📌 Cómo usar", value: "• `/topvoice` → Ver los 3 usuarios más activos esta semana.\n• `/leaderboard` → Consultar el ranking completo de todos los usuarios activos en voz." }
      )
      .setFooter({ text: "Mantente activo y escala en el ranking semanal!" })
      .setTimestamp();

    await interaction.reply({ embeds: [leaderboardInfoEmbed], ephemeral: false });
  },
};
