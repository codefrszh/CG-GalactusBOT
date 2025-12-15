const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const STAFF_ROLE_ID = '1413184321866436761'; // ID del rol Staff

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botnews')
    .setDescription('Envía un aviso del bot al canal')
    .addStringOption(o =>
      o.setName('titulo')
        .setDescription('Título del aviso')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('descripcion')
        .setDescription('Mensaje del aviso')
        .setRequired(true)
    ),

  async execute(interaction) {
    // ✅ Validación de rol
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 No tienes permisos para usar este comando.',
        ephemeral: true,
      });
    }

    const titulo = interaction.options.getString('titulo');
    const descripcion = interaction.options.getString('descripcion');

    // ✅ Embed con estética tipo “Espacio / Universo”
    const embed = new EmbedBuilder()
      .setColor('#6a00ff') // violeta espacial
      .setTitle(`🌌 ${titulo}`)
      .setDescription(descripcion)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({
        text: `🌌Comunidad Galactica`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      // ✅ Publicar el embed en el canal como mensaje del bot
      await interaction.channel.send({ embeds: [embed] });

      // ✅ Responder a la interacción de forma invisible para evitar errores
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '\u200B', ephemeral: true }); // mensaje invisible
      }

    } catch (err) {
      console.error('❌ Error enviando botnews:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Error enviando anuncio.', ephemeral: true });
      }
    }
  },
};
