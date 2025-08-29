const { REST, Routes } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    // Armar payload de comandos desde la colección cargada
    const commandsData = client.commands.map(cmd => cmd.data.toJSON());

    // Registrar como comandos de GUILD (más rápido para pruebas)
    const rest = new REST({ version: "10" }).setToken(config.token);
    try {
      const route = Routes.applicationGuildCommands(config.clientId, config.guildId);
      await rest.put(route, { body: commandsData });
      console.log(`🟢 Comandos registrados en guild ${config.guildId} (${commandsData.length})`);
      console.log(`   -> ${client.commands.map(c => c.data.name).join(", ")}`);
    } catch (err) {
      console.error("❌ Error registrando comandos:", err);
    }
  }
};
