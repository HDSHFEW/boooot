 
module.exports = {
    name: 'loop',
    description: 'Loop Queue!',
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    owner: true,
    async execute(message) {
        const player = message.client.manager.get(message.guild.id);
        if (!player) {
            return message.reply({ content: "❌ | **Mcha mochkil, player makaynch!**" });
        }

        player.setQueueRepeat(!player.queueRepeat); // Toggle Loop
        
        message.reply({
            content: player.queueRepeat
                ? "🔁 | **Loop queue enabled!**"
                : "⏹ | **Loop queue disabled!**"
        }).then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 1000);
        });
    },
};