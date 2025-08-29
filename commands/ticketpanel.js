const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("📌 Publica un panel para crear tickets."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎟️ Tickets")
      .setDescription("Presiona el botón para crear un ticket.")
      .setColor("Gold");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Crear Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
