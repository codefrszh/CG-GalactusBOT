const { createTicket, closeTicket } = require("../utils/ticketHandler");
const config = require("../config.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    const safeReply = async (content, ephemeral = true) => {
      if (interaction.replied || interaction.deferred) await interaction.followUp({ content, ephemeral });
      else await interaction.reply({ content, ephemeral });
    };

    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try { await command.execute(interaction); } 
      catch (err) { console.error(err); await safeReply("❌ Error ejecutando comando."); }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "verify_button") {
        const role = interaction.guild.roles.cache.get(config.verifyRoleId);
        if (!role) return safeReply("❌ No se encontró el rol de verificación.");
        try {
          if (interaction.member.roles.cache.has(role.id)) return safeReply("⚠️ Ya tienes el rol.");
          await interaction.member.roles.add(role);
          await safeReply(`✅ Rol **${role.name}** asignado!`);
        } catch { await safeReply("❌ No pude asignarte el rol."); }
      }

      if (interaction.customId === "create_ticket") {
        try { await createTicket(interaction); } 
        catch { await safeReply("❌ Error creando ticket."); }
      }

      if (interaction.customId === "close_ticket") {
        try { await closeTicket(interaction); } 
        catch { await safeReply("❌ Error cerrando ticket."); }
      }

      if (interaction.customId.startsWith("role_")) {
        const roleId = interaction.customId.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return safeReply("❌ Rol no existe.");
        try {
          if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);
            await safeReply(`🗑️ Rol **${role.name}** quitado.`);
          } else {
            await interaction.member.roles.add(role);
            await safeReply(`✅ Rol **${role.name}** asignado.`);
          }
        } catch { await safeReply("❌ Error asignando/quitar rol."); }
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "self_roles") {
      const roleId = interaction.values[0];
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return safeReply("❌ Rol no existe.");
      try {
        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          await safeReply(`🗑️ Rol **${role.name}** quitado.`);
        } else {
          await interaction.member.roles.add(role);
          await safeReply(`✅ Rol **${role.name}** asignado.`);
        }
      } catch { await safeReply("❌ Error asignando/quitar rol."); }
    }
  }
};
