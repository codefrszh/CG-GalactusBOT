// bot.js
require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const { sendLog } = require("./utils/logger");


// Servidor web mínimo para Render
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => res.send("Servidor web activo ✅"));
app.listen(PORT, () => console.log(`Servidor web escuchando en el puerto ${PORT}`));

// Cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// Registrar comandos
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] Comando mal formado: ${file}`);
  }
}

// Registrar eventos
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

// Al iniciar sesión
client.login(process.env.TOKEN)
  .then(() => {
    console.log("✅ Bot iniciado correctamente");
    sendLog("Bot Iniciado", `Bot activo como ${client.user.tag}`, "Green");
  })
  .catch(err => {
    console.error("❌ Error al iniciar sesión", err);
    sendLog("Error Login", `Error iniciando bot: ${err}`, "Red");
  });

// Capturar errores globales
process.on("unhandledRejection", async (reason, promise) => {
  console.error("❌ Rechazo no manejado:", reason);
  await sendLog("Error no manejado", `${reason}`, "Red");
});

process.on("uncaughtException", async (err) => {
  console.error("❌ Excepción no capturada:", err);
  await sendLog("Excepción no capturada", `${err}`, "Red");
});