// /commands/botnews.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const STAFF_ROLE_ID = '1413184321866436761'; // tu rol staff/admin

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botnews')
    .setDescription('Envía un aviso/actualización del bot en formato embed')
    .addStringOption(option =>
      option.setName('titulo')
        .setDescription('Título del anuncio')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('descripcion')
        .setDescription('Mensaje/Descripción del anuncio')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color del embed en formato HEX, ej. #3498db')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('imagen')
        .setDescription('URL de una imagen opcional para el embed')
        .setRequired(false)),

  async execute(interaction) {
    // ✅ Comprueba rol antes de continuar
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 No tienes permisos para usar este comando.',
        ephemeral: true,
      });
    }

    const titulo = interaction.options.getString('titulo');
    const descripcion = interaction.options.getString('descripcion');
    const colorInput = interaction.options.getString('color') || '#2f3136';
    const imagen = interaction.options.getString('imagen');

    const color = /^#([0-9A-F]{3}){1,2}$/i.test(colorInput)
      ? colorInput
      : '#2f3136';

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setFooter({
        text: `Anuncio enviado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (imagen) embed.setImage(imagen);

    await interaction.reply({ embeds: [embed] });
  },
};
