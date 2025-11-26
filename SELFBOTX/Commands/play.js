const { joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
  name: 'play',
  aliases: ['p'],
  description: 'Play Music!',
  inVoiceChannel: true,
  sameVoiceChannel: true,
  owner: true,
  async execute(message, args) {
    const player = message.client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
      volume: 80,
    });

    if (player.state !== "CONNECTED") await player.connect();

    const search = args.join(' ');
    let res;

    try {
      res = await player.search(search, message.author);
      if (!res) {
        return message.reply({ content: '❌ | **There is no music playing.**' });
      }

      if (res.loadType === 'LOAD_FAILED') {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      console.error(err);
      return message.reply('❌ | **There was an error while searching.**');
    }

    switch (res.loadType) {
      case 'NO_MATCHES':
        if (!player.queue.current) player.destroy();
        return message.channel.send({ content: `❌ | **No matches found for - ${search}**` });
      case 'TRACK_LOADED':
        const track = res.tracks[0];
        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size) {
          player.play();
        } else {
          return message.reply({ content: `✅ | **Added song to queue:** [${track.title}]` });
        }
        break;
      case 'PLAYLIST_LOADED':
        player.queue.add(res.tracks);
        if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
          player.play();
        }
        return message.reply({
          content: `✅ | **Added playlist to queue:** ${res.tracks.length} Songs [${res.playlist.name}](${search})`,
        });
      case 'SEARCH_RESULT':
        const selectedTrack = res.tracks[0];
        player.queue.add(selectedTrack);
        if (!player.playing && !player.paused && !player.queue.size) {
          player.play();
        } else {
          return message.reply({ content: `✅ | **Added song to queue:** [${selectedTrack.title}]` });
        }
        break;    
    }

  },
};
