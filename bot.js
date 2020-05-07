'use strict';

const fetch = require("node-fetch");
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var isTrumpetJoin = false;

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


        if(args.length > 1){
            getG2a(args);

        }


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
                isTrumpetJoin = false;
                break;

            // manages our search engine
            case 'price':
            bot.sendMessage({
                to: channelID,
                message: 'Now searching...'
            });

            if(isTrumpetJoin){
                getG2a(cmd2, channelID);
            }
           
            break;
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

//
function getG2a(aSearch, channelID) {
    var search = "https://www.g2a.com/lucene/search/filter?&search=";
    var link = "https://www.g2a.com";
    
    
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let request = new XMLHttpRequest();
    var gameJson;
    var id = 0;

    for (var i = 1; i < aSearch.length; i++ ) {
        var search = search.concat(aSearch[i],"+");
    }

    console.log(`Sending this search link ${search}`);

    request.open('GET',search, true);
    request.withCredentials = true;
    request.send();

    request.onload = function() {
        gameJson = request.responseText;
        console.log(`here is our json ${gameJson}`);
        postG2a(gameJson.docs[0].id);
        link = link.concat(gameJson.docs[0].slug);


        bot.sendMessage({
            to: channelID,
            message: `${link}`
        });

      }

      
}

function postG2a(id){
    var search = "https://www.g2a.com/marketplace/product/auctions/?id=";
    var request = new XMLHttpRequest();
    var search = search.concat(id);
    request.open('GET',search);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        gameJson = request.response;



      }


}
