const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const config = require("../config.json");
const { sendLog } = require("../utils/logger");

const createTicket = async (interaction) => {
  const category = interaction.guild.channels.cache.get(config.ticketCategoryId);
  if (!category) return interaction.reply({ content: "❌ No se encontró la categoría de tickets.", ephemeral: true });

  try {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ["ViewChannel"] },
        { id: interaction.user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] }
      ]
    });

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🛎️ Hola <@${interaction.user.id}>, un miembro del staff te atenderá pronto.`,
      components: [closeButton]
    });

    await interaction.reply({ content: `✅ Ticket creado: ${channel}`, ephemeral: true });
    await sendLog("Ticket creado", `Usuario <@${interaction.user.id}> creó un ticket en ${channel.name}`, "Blue");
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error creando ticket.", ephemeral: true });
    await sendLog("Error creando ticket", `Usuario <@${interaction.user.id}>:\n${err}`, "Red");
  }
};

const closeTicket = async (interaction) => {
  if (!interaction.channel) return;
  try {
    await interaction.channel.delete();
    await sendLog("Ticket cerrado", `Ticket cerrado por <@${interaction.user.id}>`, "Green");
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error cerrando ticket.", ephemeral: true });
    await sendLog("Error cerrando ticket", `Usuario <@${interaction.user.id}>:\n${err}`, "Red");
  }
};

module.exports = { createTicket, closeTicket };
