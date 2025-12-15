// src/commands/ping.js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ver latencia"),
  
  defer: false, // rápido, no necesita defer

   async execute(interaction, safeReply) {
    await safeReply(interaction, {
      content: `🏓 Pong! ${interaction.client.ws.ping}ms`,
    });
  },
};
