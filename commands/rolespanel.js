const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolespanel")
    .setDescription("📌 Muestra un panel de auto-asignación de roles."),
  
  async execute(interaction) {
    const roles = [
      { id: "1284015131847557130", label: "🚀 → Fortnite", description: "Canal Fortnite" },
      { id: "1284015284486930473", label: "🔫 → Warzone", description: "Canal Warzone" },
      { id: "1284016178036998287", label: "⛏️ → Minecraft", description: "Canal Minecraft" },
      { id: "1332215765738455074", label: "🚛 → Trailero", description: "Canal Trailero" },
      { id: "1284015391580098570", label: "🏎️ → Assetto Corsa", description: "Canal Assetto" },
      { id: "1284015598627455008", label: "🥊 → Brawlhalla", description: "Canal Brawlhalla" },
      { id: "1284015732035944513", label: "⚾ → MLB", description: "Canal MLB" },
      { id: "1284015825245831229", label: "🏀 → NBA", description: "Canal NBA" },
      { id: "1284018298136039525", label: "🚓 → GTA V", description: "Canal GTA V" },
      { id: "1287122561150226503", label: "👹 → Devour", description: "Canal Devour" },
      { id: "1332919654850756638", label: "🦸 → Marvelsiano", description: "Canal Marvel" },
      { id: "1286678228416860235", label: "👨‍🚀 → Among Us", description: "Canal Among Us" },
      { id: "1284015881936175135", label: "🤠 → REDM", description: "Canal REDM" },
      { id: "1284016023867228272", label: "🔥 → FiveM", description: "Canal FiveM" },
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
          description: r.description, // ahora definido
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
