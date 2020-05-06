'use strict';

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var search = "https://www.g2a.com/lucene/search/filter?"; //generates search results.
var priceSerch = "https://www.g2a.com/lucene/search/filter?"; //reliant on search results first.
var text = "";
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
    const channel = member.guild.channels.cache.find(ch => ch.name === 'bracknell');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome, ${member}, how may I be of service to you today?`);
    channel.send("Please use, !help for a list of user commands.");
});

bot.on("presenceUpdate", (oldMember, newMember) => {

});
