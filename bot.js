require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, Partials, REST, Routes } = require("discord.js");
const config = require("./config.json");

// -----------------------------
// Cliente de Discord
// -----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// -----------------------------
// Comandos
// -----------------------------
const commands = [];
const commandFiles = fs.readdirSync("./commands").filter((f) => f.endsWith(".js"));

client.commands = new Map();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

// Registrar comandos en la guild
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos en la guild...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, config.guildId),
      { body: commands }
    );
    console.log("✅ Comandos registrados correctamente");
  } catch (err) {
    console.error("❌ Error registrando comandos:", err);
  }
})();

// -----------------------------
// Eventos
// -----------------------------
client.once("clientReady", () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  require("./events/interactionCreate").execute(interaction, client);
});

// -----------------------------
// Comando prefix (!ping)
// -----------------------------
client.on("messageCreate", (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") message.reply("🏓 Pong!");
});

// -----------------------------
// Login
// -----------------------------
client.login(process.env.TOKEN).catch((err) => {
  console.error("❌ Error al iniciar sesión, revisa tu TOKEN en .env");
  console.error(err);
});

// Al final de bot.js, después de client.login(...)
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Servidor HTTP mínimo para mantener Render feliz
app.get("/", (req, res) => {
  res.send("Bot activo en Render ✅");
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en el puerto ${PORT}`);
});