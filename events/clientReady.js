module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    console.log(`✅ Bot iniciado como ${client.user.tag}`);
  }
};
