// bot.js
require("dotenv").config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const express = require("express");
const config = require("./config.json");
const { createTicket, closeTicket } = require("./utils/ticketHandler");

// -----------------------------
// Cliente de Discord
// -----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// -----------------------------
// Servidor web mínimo para Render
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot activo en Render ✅");
});

app.listen(PORT, () => console.log(`Servidor web escuchando en el puerto ${PORT}`));

// -----------------------------
// Eventos
// -----------------------------
client.once("clientReady", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  const safeReply = async (content, ephemeral = true) => {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, ephemeral });
    } else {
      await interaction.reply({ content, ephemeral });
    }
  };

  try {
    // -----------------------------
    // Comandos slash
    // -----------------------------
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    }

    // -----------------------------
    // Botones
    // -----------------------------
    if (interaction.isButton()) {
      // ===== Verificación =====
      if (interaction.customId === "verify_button") {
        const role = interaction.guild.roles.cache.get(config.verifyRoleId);
        if (!role) return safeReply("❌ No se encontró el rol de verificación.");
        if (interaction.member.roles.cache.has(role.id)) return safeReply("⚠️ Ya tienes el rol de verificación.");
        await interaction.member.roles.add(role);
        return safeReply(`✅ ¡Has sido verificado y se te asignó el rol **${role.name}**!`);
      }

      // ===== Crear Ticket =====
      if (interaction.customId === "create_ticket") {
        await createTicket(interaction);
      }

      // ===== Cerrar Ticket =====
      if (interaction.customId === "close_ticket") {
        await closeTicket(interaction);
      }

      // ===== Self Roles =====
      if (interaction.customId.startsWith("role_")) {
        const roleId = interaction.customId.split("_")[1];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return safeReply("❌ Este rol ya no existe.");

        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          return safeReply(`🗑️ Se te quitó el rol **${role.name}**.`);
        } else {
          await interaction.member.roles.add(role);
          return safeReply(`✅ Se te asignó el rol **${role.name}**.`);
        }
      }
    }

    // -----------------------------
    // Menú desplegable (Select Menu)
    // -----------------------------
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "self_roles") {
        const roleId = interaction.values[0];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return safeReply("❌ Este rol ya no existe.");

        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.member.roles.remove(role);
          return safeReply(`🗑️ Se te quitó el rol **${role.name}**.`);
        } else {
          await interaction.member.roles.add(role);
          return safeReply(`✅ Se te asignó el rol **${role.name}**.`);
        }
      }
    }

  } catch (error) {
    console.error("Error en interactionCreate:", error);
    safeReply("❌ Ocurrió un error procesando tu interacción.");
  }
});

// -----------------------------
// Comandos cargados desde carpeta "commands"
// -----------------------------
client.commands = new Map();
const fs = require("fs");
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// -----------------------------
// Login
// -----------------------------
client.login(process.env.TOKEN)
  .catch(err => {
    console.error("❌ Error al iniciar sesión, revisa tu TOKEN en .env");
    console.error(err);
  });
