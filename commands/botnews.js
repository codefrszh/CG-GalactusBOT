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

    // ✅ Embed con estética “Galactus / Espacio”
    const embed = new EmbedBuilder()
      .setColor('#6a00ff') // violeta espacial
      .setTitle(`🌌 ${titulo}`)
      .setDescription(descripcion)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({
        text: `Anuncio enviado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // ✅ Responder visiblemente en el canal
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });

    // ✅ Borrar la invocación del slash para que quede limpio el embed
    // (la API borra el mensaje de interacción, no el embed)
    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 1000); // espera 1 segundo antes de borrar la invocación
  },
};
