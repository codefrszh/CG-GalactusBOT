const { createTicket, closeTicket } = require("../utils/ticketHandler");
const config = require("../config.json");

module.exports = {
  async execute(interaction, client) {
    const safeReply = async (content, ephemeral = true) => {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, ephemeral });
      } else {
        await interaction.reply({ content, ephemeral });
      }
    };

    // Comandos slash
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error("❌ Error ejecutando comando:", err);
        await safeReply("❌ Hubo un error ejecutando este comando.");
      }
    }

    // Botones
    if (interaction.isButton()) {
      // Verificación
      if (interaction.customId === "verify_button") {
        const role = interaction.guild.roles.cache.get(config.verifyRoleId);
        if (!role) return safeReply("❌ No se encontró el rol de verificación.");
        try {
          if (interaction.member.roles.cache.has(role.id)) return safeReply("⚠️ Ya tienes el rol de verificación.");
          await interaction.member.roles.add(role);
          await safeReply(`✅ ¡Has sido verificado y se te asignó el rol **${role.name}**!`);
        } catch (err) {
          console.error(err);
          await safeReply("❌ No pude asignarte el rol. Revisa mis permisos.");
        }
      }

      // Crear ticket
      if (interaction.customId === "create_ticket") {
        try {
          await createTicket(interaction);
        } catch (err) {
          console.error(err);
          await safeReply("❌ No se pudo crear el ticket.");
        }
      }

      // Cerrar ticket
      if (interaction.customId === "close_ticket") {
        try {
          await closeTicket(interaction);
        } catch (err) {
          console.error(err);
          await safeReply("❌ No se pudo cerrar el ticket.");
        }
      }

      // Self roles (botones)
      if (interaction.customId.startsWith("role_")) {
        const roleId = interaction.customId.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return safeReply("❌ Este rol ya no existe.");

        try {
          if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);
            await safeReply(`🗑️ Se te quitó el rol **${role.name}**.`);
          } else {
            await interaction.member.roles.add(role);
            await safeReply(`✅ Se te asignó el rol **${role.name}**.`);
          }
        } catch (err) {
          console.error(err);
          await safeReply("❌ No pude asignar/quitar el rol. Revisa mis permisos.");
        }
      }
    }

    // Select menus
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "self_roles") {
        const roleId = interaction.values[0];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return safeReply("❌ Este rol ya no existe.");

        try {
          if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);
            await safeReply(`🗑️ Se te quitó el rol **${role.name}**.`);
          } else {
            await interaction.member.roles.add(role);
            await safeReply(`✅ Se te asignó el rol **${role.name}**.`);
          }
        } catch (err) {
          console.error(err);
          await safeReply("❌ No pude asignar/quitar el rol. Revisa mis permisos.");
        }
      }
    }
  },
};
