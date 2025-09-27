const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const STAFF_ROLE_ID = '1413184321866436761'; // ID del rol Staff

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botnews')
    .setDescription('Envía un aviso del bot')
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

    // ✅ defer (respuesta ephemera temporal)
    await interaction.deferReply({ flags: 64 }).catch(() => {});

    const titulo = interaction.options.getString('titulo');
    const descripcion = interaction.options.getString('descripcion');

    // ✅ Embed con estética tipo “noticia”
    const embed = new EmbedBuilder()
      .setColor('#2f3136') // gris oscuro estilo Discord
      .setTitle(`📢 ${titulo}`)
      .setDescription(descripcion)
      .setThumbnail(interaction.client.user.displayAvatarURL()) // avatar del bot
      .setFooter({
        text: `Anuncio enviado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // ✅ Editar la respuesta diferida y hacerla visible (flags: 0)
    await interaction.editReply({ embeds: [embed], flags: 0 }).catch(console.error);
  },
};
