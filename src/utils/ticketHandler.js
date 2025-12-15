const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");

module.exports = {
  async createTicket(interaction) {
    const guild = interaction.guild;
    const staffRole = guild.roles.cache.get(config.staffRoleId);
    const category = guild.channels.cache.get(config.ticketCategoryId);

    // Evitar duplicados
    const existing = guild.channels.cache.find(
      c => c.type === ChannelType.GuildText && c.topic === `ticket:${interaction.user.id}`
    );
    if (existing) {
      return interaction.reply({
        content: `⚠️ Ya tienes un ticket abierto: ${existing}`,
        ephemeral: true,
      });
    }

    // Nombre seguro del canal
    const safeName = interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9_\-]/g, "")
      .slice(0, 20);

    // Crear canal
    const channel = await guild.channels.create({
      name: `ticket-${safeName}-${interaction.user.id.slice(-4)}`,
      type: ChannelType.GuildText,
      parent: category ? category.id : null,
      topic: `ticket:${interaction.user.id}`,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        ...(staffRole
          ? [
              {
                id: staffRole.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              },
            ]
          : []),
      ],
    });

    // Responder al usuario que creó el ticket
    await interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true,
    });

    // Botón para cerrar el ticket
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    // Mensaje dentro del canal de ticket
    await channel.send({
      content: `🎟️ Hola ${interaction.user}, un miembro del staff te atenderá pronto.`,
      components: [row],
    });
  },

  async closeTicket(interaction) {
    await interaction.reply({ content: "🔒 Cerrando ticket en 5 segundos...", ephemeral: true });
    setTimeout(() => {
      interaction.channel.delete().catch(() => null);
    }, 5000);
  },
};
