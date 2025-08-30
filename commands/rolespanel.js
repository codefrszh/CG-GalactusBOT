const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { sendLog } = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolespanel")
    .setDescription("📌 Muestra un panel de auto-asignación de roles."),

  async execute(interaction) {
    const roles = [
      { id: "", label: "Seleccionar" },
      { id: "1284015131847557130", label: "🚀 → Fortnite" },
      { id: "1284015284486930473", label: "🔫 → Warzone" },
      { id: "1332215765738455074", label: "🚛 → Trailero " },
      { id: "1284015391580098570", label: "🏎️ → Assetto Corsa" },
      { id: "1284015598627455008", label: "🥊 → Brawlhalla" },
      { id: "1284015732035944513", label: "⚾ → MLB" },
      { id: "1284015825245831229", label: "🏀 → NBA" },
      { id: "1332919654850756638", label: "🦸 → Marvelsiano" },
      { id: "1286678228416860235", label: "👨‍🚀 → Among Us" },
      { id: "1284015881936175135", label: "🤠 → REDM " },
      { id: "1284016023867228272", label: "🔥 → FiveM" }
    ];

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("🎭 Selección de Roles")
      .setDescription("Selecciona un rol del menú desplegable para asignártelo o quitarlo.");

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("self_roles")
      .setPlaceholder("Selecciona un rol...")
       .addOptions(
        roles.map(r => ({
          label: r.label,
          value: r.id,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
