const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // 🔹 Comandos
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ Hubo un error ejecutando este comando.", ephemeral: true });
      }
    }

    // 🔹 Menú desplegable
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "main_menu") {
        const selection = interaction.values[0];

        if (selection === "verify") {
          const role = interaction.guild.roles.cache.get(config.verifyRoleId);
          if (!role) {
            return interaction.reply({ content: "❌ No se encontró el rol configurado.", ephemeral: true });
          }

          try {
            await interaction.member.roles.add(role);
            await interaction.reply({ content: `✅ ¡Has sido verificado y se te asignó el rol **${role.name}**!`, ephemeral: true });
          } catch (err) {
            console.error("Error asignando rol:", err);
            await interaction.reply({ content: "❌ No pude asignarte el rol. Revisa mis permisos.", ephemeral: true });
          }
        }

        if (selection === "ticket") {
          await interaction.reply({ content: "🎟️ Ticket creado (placeholder, falta lógica).", ephemeral: true });
        }

        // 🔹 Limpiar selección para permitir elegir otra vez
        await interaction.update({
          components: [
            new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("main_menu")
                .setPlaceholder("Selecciona una opción...")
                .addOptions([
                  { label: "✅ Verificación", value: "verify", description: "Obtén tu rol de verificado." },
                  { label: "🎟️ Crear Ticket", value: "ticket", description: "Crea un ticket de soporte." }
                ])
            )
          ]
        });
      }
    }
  }
};
