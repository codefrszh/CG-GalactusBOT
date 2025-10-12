// src/events/interactionCreate.js
const { createTicket, closeTicket } = require("../utils/ticketHandler");
const config = require("../config.json");
const { sendLog } = require("../utils/logger");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    // -----------------------------
    // Función segura para responder
    // -----------------------------
    const safeReply = async (content, ephemeral = true) => {
      try {
        // ephemeral se reemplaza por flags para evitar warnings
        const options = typeof content === "string" ? { content } : content;
        options.flags = ephemeral ? 64 : 0; // 64 = EPHEMERAL
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(options).catch(console.error);
        } else {
          await interaction.reply(options).catch(console.error);
        }
      } catch (err) {
        console.error("❌ Error enviando respuesta:", err);
      }
    };

    // -----------------------------
    // Slash Commands
    // -----------------------------
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      // Rol permitido para /botnews
      if (interaction.commandName === "botnews") {
        const requiredRoleId = "1413184321866436761";
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return safeReply("🚫 No tienes permisos para usar este comando.");
        }
      }

      // Defer solo si el comando lo requiere
      if (command.defer) {
        await interaction.deferReply({ flags: 64 }).catch(() => {});
      }

      try {
        // Ejecutar comando
        const replied = await command.execute(interaction);

        // Log de ejecución
        await sendLog(
          "Comando ejecutado",
          `Usuario <@${interaction.user.id}> ejecutó /${interaction.commandName}`,
          "Blue"
        );

        if (replied === false) {
          await safeReply("❌ Error ejecutando comando.");
        }
      } catch (err) {
        console.error(err);
        await safeReply("❌ Error ejecutando comando.");
        await sendLog(
          "Error comando",
          `Error ejecutando /${interaction.commandName}:\n${err}`,
          "Red"
        );
      }
    }

    // -----------------------------
    // Botones
    // -----------------------------
    if (interaction.isButton()) {
      const id = interaction.customId;

      // ===== Verificación =====
      if (id === "verify_button") {
        const role = interaction.guild.roles.cache.get(config.verifyRoleId);
        if (!role) return await safeReply("❌ No se encontró el rol de verificación.");

        try {
          if (interaction.member.roles.cache.has(role.id)) {
            await safeReply("⚠️ Ya tienes el rol.");
            return sendLog("Verificación existente", `Usuario <@${interaction.user.id}> ya tenía el rol ${role.name}`, "Yellow");
          }
          await interaction.member.roles.add(role);
          await safeReply(`✅ Rol **${role.name}** asignado!`);
          await sendLog("Rol asignado", `Usuario <@${interaction.user.id}> recibió rol ${role.name}`, "Green");
        } catch (err) {
          console.error(err);
          await safeReply("❌ No pude asignarte el rol.");
          await sendLog("Error asignando rol", `Error asignando rol ${role.name} a <@${interaction.user.id}>:\n${err}`, "Red");
        }
      }

      // ===== Crear Ticket =====
      if (id === "create_ticket") {
        try {
          await createTicket(interaction);
          await sendLog("Ticket creado", `Usuario <@${interaction.user.id}> creó un ticket`, "Blue");
        } catch (err) {
          console.error(err);
          await safeReply("❌ Error creando ticket.");
          await sendLog("Error ticket", `Error creando ticket para <@${interaction.user.id}>:\n${err}`, "Red");
        }
      }

      // ===== Cerrar Ticket =====
      if (id === "close_ticket") {
        try {
          await closeTicket(interaction);
          await sendLog("Ticket cerrado", `Usuario <@${interaction.user.id}> cerró un ticket`, "Blue");
        } catch (err) {
          console.error(err);
          await safeReply("❌ Error cerrando ticket.");
          await sendLog("Error cerrar ticket", `Error cerrando ticket por <@${interaction.user.id}>:\n${err}`, "Red");
        }
      }

      // ===== Self Roles =====
      if (id.startsWith("role_")) {
        const roleId = id.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return await safeReply("❌ Rol no existe.");

        try {
          if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);
            await safeReply(`🗑️ Rol **${role.name}** quitado.`);
            await sendLog("Rol quitado", `Usuario <@${interaction.user.id}> se quitó el rol ${role.name}`, "Yellow");
          } else {
            await interaction.member.roles.add(role);
            await safeReply(`✅ Rol **${role.name}** asignado.`);
            await sendLog("Rol asignado", `Usuario <@${interaction.user.id}> recibió rol ${role.name}`, "Green");
          }
        } catch (err) {
          console.error(err);
          await safeReply("❌ Error asignando/quitar rol.");
          await sendLog("Error self role", `Error asignando/quitar rol ${role.name} a <@${interaction.user.id}>:\n${err}`, "Red");
        }
      }
    }

    // -----------------------------
    // Menú desplegable Self Roles
    // -----------------------------
    if (interaction.isStringSelectMenu() && interaction.customId === "self_roles") {
      const roleId = interaction.values[0];
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return await safeReply("❌ Rol no existe.");

      try {
        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          await safeReply(`🗑️ Rol **${role.name}** quitado.`);
          await sendLog("Rol quitado select", `Usuario <@${interaction.user.id}> se quitó el rol ${role.name}`, "Yellow");
        } else {
          await interaction.member.roles.add(role);
          await safeReply(`✅ Rol **${role.name}** asignado.`);
          await sendLog("Rol asignado select", `Usuario <@${interaction.user.id}> recibió rol ${role.name}`, "Green");
        }
      } catch (err) {
        console.error(err);
        await safeReply("❌ Error asignando/quitar rol.");
        await sendLog("Error select role", `Error asignando/quitar rol ${role.name} a <@${interaction.user.id}>:\n${err}`, "Red");
      }
    }
  },
};
