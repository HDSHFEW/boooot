module.exports = {
    name: "stop",
    description: "Stop Music!",
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    owner: true,
    async execute(message) {
      const player = message.client.manager.get(message.guild.id);
  
      // Ensure there is a player for the guild
      if (!player)
        return message.reply({ content: "No music is currently playing." });
  
      // Stop the music but keep the bot connected
      player.stop();
  
      // Send a confirmation message and delete after 1 second
      message.reply({ content: "Music Stopped!" }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 1000);
      });
    },
  };