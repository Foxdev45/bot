const { isValidUrl } = require('../utils/functions/isValidUrl');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Enter your song link or song name to play',
    usage: 'play <URL/song name>',
    voiceChannel: true,
    options: [
        {
            name: "search",
            description: "The song link or song name",
            type: 3,
            required: true
        }
    ],

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply({ content: `❌ | Write the name of the music you want to search.`, allowedMentions: { repliedUser: false } });
        }

        const str = args.join(' ');
        let queryType = '';

        if (isValidUrl(str)) queryType = client.config.urlQuery;
        else queryType = client.config.textQuery;

        console.log(`Searching for: ${str} with query type: ${queryType}`);

        const results = await client.player.search(str, {
            requestedBy: message.member,
            searchEngine: queryType
        }).catch((error) => {
            console.error('Search error:', error);
            return message.reply({ content: `❌ | The service is experiencing some problems, please try again.`, allowedMentions: { repliedUser: false } });
        });

        if (!results || !results.hasTracks()) {
            return message.reply({ content: `❌ | No results found.`, allowedMentions: { repliedUser: false } });
        }

        console.log(`Search results: ${results.tracks.length} tracks found`);

        const queue = await client.player.nodes.create(message.guild.id, {
            metadata: {
                channel: message.channel,
                client: message.guild.members.me,
                requestedBy: message.user
            },
            selfDeaf: true,
            leaveOnEmpty: client.config.autoLeave,
            leaveOnEnd: client.config.autoLeave,
            leaveOnEmptyCooldown: client.config.autoLeaveCooldown,
            leaveOnEndCooldown: client.config.autoLeaveCooldown,
            volume: client.config.defaultVolume,
            connectionTimeout: 999_999_999
        });

        try {
            if (!queue.connection) {
                await queue.connect(message.member.voice.channel);
                console.log('Connected to voice channel');
            }
        } catch (error) {
            console.error('Connection error:', error);
            if (!queue.deleted) queue.delete();
            return message.reply({ content: `❌ | I can't join audio channel.`, allowedMentions: { repliedUser: false } });
        }

        results.playlist ? queue.addTrack(results.tracks) : queue.addTrack(results.tracks[0]);
        console.log('Tracks added to the queue');

        if (!queue.isPlaying()) {
            await queue.node.play().catch((error) => {
                console.error('Play error:', error);
                return message.reply({ content: `❌ | I can't play this track.`, allowedMentions: { repliedUser: false } });
            });
        } else {
            console.log('Queue is already playing');
        }

        return message.react('👍');
    },

    async slashExecute(client, interaction) {
        const str = interaction.options.getString("search");
        let queryType = '';

        if (isValidUrl(str)) queryType = client.config.urlQuery;
        else queryType = client.config.textQuery;

        console.log(`Searching for: ${str} with query type: ${queryType}`);

        const results = await client.player.search(str, {
            requestedBy: interaction.member,
            searchEngine: queryType
        }).catch((error) => {
            console.error('Search error:', error);
            return interaction.reply({ content: `❌ | The service is experiencing some problems, please try again.`, allowedMentions: { repliedUser: false } });
        });

        if (!results || !results.tracks.length) {
            return interaction.reply({ content: `❌ | No results found.`, allowedMentions: { repliedUser: false } });
        }

        console.log(`Search results: ${results.tracks.length} tracks found`);

        const queue = await client.player.nodes.create(interaction.guild.id, {
            metadata: {
                channel: interaction.channel,
                client: interaction.guild.members.me,
                requestedBy: interaction.user
            },
            selfDeaf: true,
            leaveOnEmpty: client.config.autoLeave,
            leaveOnEnd: client.config.autoLeave,
            leaveOnEmptyCooldown: client.config.autoLeaveCooldown,
            leaveOnEndCooldown: client.config.autoLeaveCooldown,
            skipOnNoStream: true,
            volume: client.config.defaultVolume,
            connectionTimeout: 999_999_999
        });

        try {
            if (!queue.connection) {
                await queue.connect(interaction.member.voice.channel);
                console.log('Connected to voice channel');
            }
        } catch (error) {
            console.error('Connection error:', error);
            if (!queue.deleted) queue.delete();
            return interaction.reply({ content: `❌ | I can't join audio channel.`, allowedMentions: { repliedUser: false } });
        }

        results.playlist ? queue.addTrack(results.tracks) : queue.addTrack(results.tracks[0]);
        console.log('Tracks added to the queue');

        if (!queue.isPlaying()) {
            await queue.node.play().catch((error) => {
                console.error('Play error:', error);
                return interaction.reply({ content: `❌ | I can't play this track.`, allowedMentions: { repliedUser: false } });
            });
        } else {
            console.log('Queue is already playing');
        }

        return interaction.reply("✅ | Music added.");
    },
};
