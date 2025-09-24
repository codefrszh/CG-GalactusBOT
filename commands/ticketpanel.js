// commands/ticketpanel.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Publica el panel de tickets en este canal.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // Comprobar permisos del bot en el canal actual
    const botMember = await interaction.guild.members.fetchMe();
    const botPerms = interaction.channel.permissionsFor(botMember);
    if (!botPerms || !botPerms.has("SendMessages") || !botPerms.has("UseApplicationCommands")) {
      return interaction.reply({ content: "❌ No tengo permisos para enviar mensajes en este canal. Dame permiso de enviar mensajes y usar comandos.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Soporte / Tickets")
      .setDescription("Presiona **Crear Ticket** para abrir un chat privado con el staff.\nPor favor, explica tu problema o solicitud con claridad.")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Crear Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    // Enviamos el panel al canal
    await interaction.channel.send({ embeds: [embed], components: [row] })
      .catch(async (err) => {
        console.error("Error enviando ticket panel:", err);
        await interaction.reply({ content: "❌ No pude publicar el panel aquí. Revisa mis permisos o intenta en otro canal.", ephemeral: true });
      });

    await interaction.reply({ content: "✅ Panel de tickets publicado.", ephemeral: true });
  }
};
