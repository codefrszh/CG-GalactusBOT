// commands/resetvoice.js
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "../voiceData.json");
const { voiceActivity } = require("../events/voiceStateUpdate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetvoice")
    .setDescription("Reinicia el contador de minutos de voz"),
  async execute(interaction) {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply("⚠️ Solo administradores pueden usar este comando.");
    }

    voiceActivity.clear();
    if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);

    await interaction.reply("🗑️ Datos de voz reiniciados.");
  }
};
