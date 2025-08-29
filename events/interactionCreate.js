const { createTicket, closeTicket } = require("../utils/ticketHandler");
const config = require("../config.json");
const { sendLog } = require("../utils/logger");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    const safeReply = async (content, ephemeral = true) => {
      if (interaction.replied || interaction.deferred) await interaction.followUp({ content, ephemeral });
      else await interaction.reply({ content, ephemeral });
    };

    try {
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        sendLog(`✅ Comando ejecutado: ${interaction.commandName} por ${interaction.user.tag}`);
      }

      if (interaction.isButton()) {
        if (interaction.customId === "verify_button") {
          const role = interaction.guild.roles.cache.get(config.verifyRoleId);
          if (!role) return safeReply("❌ No se encontró el rol.");
          if (interaction.member.roles.cache.has(role.id)) return safeReply("⚠️ Ya tienes el rol.");
          await interaction.member.roles.add(role);
          await safeReply(`✅ Rol **${role.name}** asignado!`);
          sendLog(`✅ ${interaction.user.tag} recibió rol ${role.name}`);
        }

        if (interaction.customId === "create_ticket") await createTicket(interaction);
        if (interaction.customId === "close_ticket") await closeTicket(interaction);

        if (interaction.customId.startsWith("role_")) {
          const roleId = interaction.customId.split("_")[1];
          const role = interaction.guild.roles.cache.get(roleId);
          if (!role) return safeReply("❌ Rol no existe.");
          if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);
            await safeReply(`🗑️ Rol **${role.name}** quitado.`);
          } else {
            await interaction.member.roles.add(role);
            await safeReply(`✅ Rol **${role.name}** asignado.`);
          }
          sendLog(`🔄 ${interaction.user.tag} cambió rol ${role.name}`);
        }
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "self_roles") {
        const roleId = interaction.values[0];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return safeReply("❌ Rol no existe.");
        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          await safeReply(`🗑️ Rol **${role.name}** quitado.`);
        } else {
          await interaction.member.roles.add(role);
          await safeReply(`✅ Rol **${role.name}** asignado.`);
        }
        sendLog(`🔄 ${interaction.user.tag} cambió rol ${role.name} (select menu)`);
      }

    } catch (err) {
      console.error("Error en interactionCreate:", err);
      sendLog(`❌ Error en interactionCreate: ${err.message}`);
      safeReply("❌ Ocurrió un error.");
    }
  }
};
