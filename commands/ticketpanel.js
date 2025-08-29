const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Crea el panel de tickets en este canal."),
  
  async execute(interaction) {
    const channel = interaction.channel;

    // Validar permisos del bot en el canal actual
    if (!channel.permissionsFor(interaction.client.user).has("SendMessages")) {
      return interaction.reply({ 
        content: "❌ No tengo permisos para enviar mensajes en este canal.", 
        ephemeral: true 
      });
    }

    // Embed del panel de tickets
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("🎫 Soporte - Crear Ticket")
      .setDescription("Si necesitas ayuda, presiona el botón de abajo para crear un ticket. Un miembro del staff te atenderá pronto.");

    // Botón para abrir ticket
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("📩 Crear Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    // Enviar embed en el canal donde se ejecutó el comando
    await channel.send({ embeds: [embed], components: [button] });

    // Responder al usuario
    await interaction.reply({ content: "✅ Panel de tickets creado en este canal.", ephemeral: true });
  },
};
