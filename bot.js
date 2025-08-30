// bot.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
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
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (!command.data || !command.data.name) {
    console.warn(`⚠️ El archivo ${file} no exporta un comando válido.`);
    continue;
  }
  client.commands.set(command.data.name, command);
  console.log(`✅ Comando cargado: ${command.data.name}`);
}

// -----------------------------
// Evento ready
// -----------------------------
client.once("clientReady", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  sendLog("Bot Iniciado", `El bot se ha iniciado correctamente como **${client.user.tag}**`, "Green");

  // =========================
  // Actividad del bot
  // =========================
  client.user.setPresence({
    activities: [{ name: "🌌 Una Galaxia", type: 3 }], // type 0 = "Playing"
    status: "online" // online, idle, dnd, invisible
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
      // Node.js 18+ tiene fetch global; si no, instalar node-fetch
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


