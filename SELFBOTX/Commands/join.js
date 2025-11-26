module.exports = {
    name: 'join',
    description: 'Join the voice channel!',
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    owner: true,
    async execute(message) {
      // tatkon dakhl a zb l vc 3ad hdr m3a kri
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return message.reply('You need to be in a voice channel to use this command.');
      }
  
// creat player azb
      const player = message.client.manager.create({
        guild: message.guild.id,
        voiceChannel: voiceChannel.id,
        textChannel: message.channel.id,
        volume: 80,
        selfDeafen: false,
      });
  
      // had tmjnina bach yt connecta
      if (player.state !== 'CONNECTED') {
        player.connect();
        return message.reply(`Joined voice channel: **${voiceChannel.name}**`);
      } else {
        return message.reply('Already connected to a voice channel.');
      }

    },

  };
  
