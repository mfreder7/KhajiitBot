var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var isTrumpetJoin = false;
var isTrumpetLeave = false;

const pairs = require('./channelPairs.json'); // Path for server/txt pairs

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'trumpetJoin':
                bot.sendMessage({
                    to: channelID,
                    message: 'Your wish is my command.'
                });
                isTrumpetJoin = true;
                break;

            case 'trumpetLeave':
                bot.sendMessage({
                    to: channelID,
                    message: 'Your wish is my command.'
                });
                isTrumpetLeave = true;
                break;
            // Just add any case commands if you want to..
        }
    }
});

// Create an event listener for new guild members
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send("Welcome, ${member}, how may I be of service to you today?");
});

bot.on('presenceUpdate', (oldMember, newMember) => {
    // Wasn't in a VC, now is.
    if (!oldMember.voiceChannel && newMember.voiceChannel) {
        // Don't include this if statement if you want it to be in any voice channel
        for (let i = 0; i < pairs.length; i++) {
            const textChannel = newMember.guild.channels.get(pairs[i].text);
            if (!textChannel) {
                console.log('Invalid text channel ID in json.');
                continue;
            }

            const vcID = pairs[i].voice;

            if (isTrumpetJoin === true) {
                textChannel.send("${newMember} has joined the voice channel.")
            }


            // Code to play music goes here; you can look this up yourself or ask how to do this.
        }
    }
});

// bot.on('voiceStateUpdate', (oldMember, newMember) => {
//     //Here I'm storing the IDs of their voice channels, if available
//     let oldChannel = oldMember.voiceChannel ? oldMember.voiceChannel.id : null
//     let newChannel = newMember.voiceChannel ? newMember.voiceChannel.id : null

//     for (let i = 0; i < pairs.length; i++) {
//         const textChannel = newMember.guild.channels.get(pairs[i].text);
//         if (!textChannel) {
//             console.log('Invalid text channel ID in json.');
//             continue;
//         }

//         const vcID = pairs[i].voice;


//         if (oldChannel == newChannel) return; // If there has been no change, exit

//         // Here I'm getting the bot's channel (bot.voiceChannel does not exist)
//         let botMember = oldMember.guild.member(bot.user),
//             botChannel = botMember ? botMember.voiceChannel.id : null;

//         // Here I don't need to check if they're the same, since it would've exit before
//         if (newChannel == botChannel) {
//             // console.log("A user joined.");
//             textChannel.send(`${newMember} has joined the voice channel.`);
//         } else if (oldChannel == botChannel) {
//             // console.log("A user left.");
//             textChannel.send(`${newMember} has left the voice channel.`);
//         }
//     }
// });


