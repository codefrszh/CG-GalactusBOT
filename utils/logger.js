const { WebhookClient, EmbedBuilder } = require("discord.js");

let webhook;
if (process.env.WEBHOOK_URL) {
  const [id, token] = process.env.WEBHOOK_URL.split("/").slice(-2);
  webhook = new WebhookClient({ id, token });
}

const sendLog = async (title, description, color = "Blue") => {
  if (!webhook) return console.log("❌ WEBHOOK_URL no definido");

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  try {
    await webhook.send({ embeds: [embed] });
  } catch (err) {
    console.error("❌ Error enviando log al webhook:", err);
  }
};

module.exports = { sendLog };
