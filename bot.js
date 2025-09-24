// bot.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { 
  Client, 
  Collection, 
  GatewayIntentBits, 
  Partials, 
  REST, 
  Routes, 
  SlashCommandBuilder 
} = require("discord.js");
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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// -----------------------------
// Colección de comandos
// -----------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

// Cargar comandos
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command.data || !command.data.name) {
    console.warn(`⚠️ Comando inválido: ${file}`);
    continue;
  }
  client.commands.set(command.data.name, command);
  console.log(`✅ Comando cargado: ${command.data.name}`);
}

// -----------------------------
// Colección de eventos
// -----------------------------
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (!event.name || !event.execute) {
    console.warn(`⚠️ Evento inválido: ${file}`);
    continue;
  }
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ Evento cargado: ${event.name}`);
}

// -----------------------------
// Registrar comandos slash
// -----------------------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // servidor de prueba

(async () => {
  try {
    console.log("⏳ Registrando comandos slash...");
    const slashCommands = [...client.commands.values()]
      .filter(cmd => cmd.data instanceof SlashCommandBuilder)
      .map(cmd => cmd.data.toJSON());

    if (!guildId) {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: slashCommands }
      );
      console.log("✅ Comandos registrados globalmente (puede tardar hasta 1h).");
    } else {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: slashCommands }
      );
      console.log("✅ Comandos registrados en el servidor de prueba.");
    }
    sendLog("Deploy Comandos", "✅ Comandos slash actualizados correctamente.", "Green");
  } catch (error) {
    console.error("❌ Error registrando comandos slash:", error);
    sendLog("Error Deploy Comandos", `${error}`, "Red");
  }
})();

// -----------------------------
// Evento clientReady
// -----------------------------
client.once("clientReady", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  sendLog("Bot Iniciado", `El bot se ha iniciado correctamente como **${client.user.tag}**`, "Green");

  // Actividad
  client.user.setPresence({
    activities: [{ name: "☄️ 3I|Atlas", type: 3 }], // viendo
    status: "online"
  });
});

// -----------------------------
// Interacciones slash
// -----------------------------
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
    sendLog("Comando Ejecutado", `Usuario <@${interaction.user.id}> ejecutó /${interaction.commandName}`, "Blue");
  } catch (err) {
    console.error("❌ Error en interactionCreate:", err);
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
// Servidor web Render
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
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000;
const keepAliveUrl = process.env.URL;

if (keepAliveUrl) {
  setInterval(async () => {
    try {
      await fetch(keepAliveUrl, { method: "GET" });
      console.log("🔄 Auto-ping enviado a Render");
      sendLog("KeepAlive", `🔄 Auto-ping enviado al servidor (${keepAliveUrl})`, "Blue");
    } catch (err) {
      console.error("❌ Error en auto-ping:", err);
      sendLog("KeepAlive Error", `${err}`, "Red");
    }
  }, KEEP_ALIVE_INTERVAL);
} else {
  console.warn("⚠️ process.env.URL no definido, auto-ping desactivado.");
}
