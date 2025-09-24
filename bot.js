// bot.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } = require("discord.js");
const { sendLog } = require("./utils/logger");
const config = require("./config.json");

// -----------------------------
// Crear cliente
// -----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// -----------------------------
// Colección de comandos
// -----------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

// Cargar comandos en memoria
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.data || !command.data.name) {
    console.warn(`⚠️ El archivo ${file} no exporta un comando válido.`);
    continue;
  }
  client.commands.set(command.data.name, command);
  console.log(`✅ Comando cargado: ${command.data.name}`);
}

// -----------------------------
// Registrar comandos slash en Discord
// -----------------------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // ID del servidor de prueba

const slashCommands = commandFiles
  .map(file => require(path.join(commandsPath, file)))
  .filter(cmd => cmd.data instanceof SlashCommandBuilder)
  .map(cmd => cmd.data.toJSON());

(async () => {
  try {
    console.log("⏳ Registrando comandos slash...");
    if (!guildId) {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: slashCommands }
      );
      console.log("✅ Comandos registrados globalmente (puede tardar hasta 1h en aparecer).");
    } else {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: slashCommands }
      );
      console.log("✅ Comandos registrados en el servidor de prueba.");
    }
  } catch (error) {
    console.error("❌ Error registrando comandos slash:", error);
    sendLog("Error Deploy Comandos", `${error}`, "Red");
  }
})();

// -----------------------------
// Evento ready
// -----------------------------
client.once("ready", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  sendLog("Bot Iniciado", `El bot se ha iniciado correctamente como **${client.user.tag}**`, "Green");

  // Actividad del bot
  client.user.setPresence({
    activities: [{ name: "☄️ 3I|Atlas", type: 3 }], // type 3 = "Viendo"
    status: "online"
  });
});

// -----------------------------
// Evento interactionCreate
// -----------------------------
client.on("interactionCreate", async (interaction) => {
  try {
    const event = require("./events/interactionCreate");
    await event.execute(interaction);
  } catch (err) {
    console.error("Error en interactionCreate:", err);
    sendLog("Error interactionCreate", `${err}`, "Red");
  }
});

// -----------------------------
// Comandos por prefix (ejemplo ping)
// -----------------------------
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commandName === "ping") {
    await message.reply("🏓 Pong!");
    sendLog("Comando Ping", `Usuario <@${message.author.id}> ejecutó !ping`, "Blue");
  }
});

// -----------------------------
// Login del bot
// -----------------------------
client.login(process.env.TOKEN)
  .then(() => console.log("🔑 Token válido, bot conectado."))
  .catch((err) => {
    console.error("❌ Error al iniciar sesión, revisa tu TOKEN en .env");
    console.error(err);
  });

// -----------------------------
// Servidor web para mantener vivo en Render
// -----------------------------
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Servidor web activo ✅");
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en el puerto ${PORT}`);
});

// -----------------------------
// Auto-ping para mantener vivo en Render
// -----------------------------
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // cada 5 minutos
const keepAliveUrl = process.env.URL; // URL pública de Render desde .env

if (keepAliveUrl) {
  setInterval(async () => {
    try {
      await fetch(keepAliveUrl, { method: "GET" });
      console.log("🔄 Auto-ping enviado a Render");
      sendLog("KeepAlive", `Auto-ping enviado al servidor (${keepAliveUrl})`, "Blue");
    } catch (err) {
      console.error("❌ Error en auto-ping:", err);
      sendLog("KeepAlive Error", `${err}`, "Red");
    }
  }, KEEP_ALIVE_INTERVAL);
} else {
  console.warn("⚠️ process.env.URL no definido, auto-ping desactivado.");
}
