const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verifypanel")
    .setDescription("Crea el panel de verificación en este canal."),
  
  async execute(interaction) {
    // Canal en el que se ejecuta el comando
    const channel = interaction.channel;

    // Validar permisos del bot en el canal actual
    if (!channel.permissionsFor(interaction.client.user).has("SendMessages")) {
      return interaction.reply({ 
        content: "❌ No tengo permisos para enviar mensajes en este canal.", 
        ephemeral: true 
      });
    }

    // Embed de verificación
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Verificación requerida")
      .setDescription("Presiona el botón de abajo para verificarte y obtener acceso al servidor.");

    // Botón de verificación
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_button")
        .setLabel("Verificar")
        .setStyle(ButtonStyle.Success)
    );

    // Enviar embed al canal donde se ejecutó
    await channel.send({ embeds: [embed], components: [button] });

    // Respuesta al comando
    await interaction.reply({ content: "✅ Panel de verificación creado en este canal.", ephemeral: true });
  },
};
