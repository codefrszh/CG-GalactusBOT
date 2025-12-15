const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const { sendLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verifypanel")
    .setDescription("Publica el panel de verificación en el canal actual"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("✅ Verificación")
      .setDescription("Presiona el botón para verificarte y obtener acceso al servidor.")
      .setColor("Green");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_button")
        .setLabel("Verificarme")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
