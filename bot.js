'use strict';



const {Builder, Capabilities} = require('selenium-webdriver');
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


        switch (cmd) {
            // !ping
            case 'trumpetJoin':{
                bot.sendMessage({
                    to: channelID,
                    message: 'Your wish is my command.'
                });
                isTrumpetJoin = true;
                break;}

            case 'trumpetLeave':{
                bot.sendMessage({
                    to: channelID,
                    message: 'Your wish is my command.'
                });
                isTrumpetJoin = false;
                break;}

            // manages our search engine
            case 'game':{

            if(isTrumpetJoin){
                bot.sendMessage({
                    to: channelID,
                    message: 'Now searching...'
                });
                getG2a(args, channelID);

                
            }
           
            break;}
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
async function getG2a(aSearch, channelID) {
    let driver = new Builder().forBrowser('chrome').build();
    var search = "https://www.g2a.com/search?query=";
    var link = "https://www.g2a.com";
    
    var casigningcert = "cacert.pem";
    
    
    // var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // let request = new XMLHttpRequest();
    var gameJson;
    var id = 0;

    for (var i = 1; i < aSearch.length; i++ ) {
        var search = search.concat(aSearch[i],"+");
    }

    try {
        console.log(`Sending this search link ${search}`);
        driver.get('http://www.google.com/')
        (await driver).get("http://www.g2a.com/");
        // (await driver).get(search);
        
        

    }
    catch {
        // Navigate to Url
        driver.quit();

    }
    finally{
        driver.quit();
    }


    console.log(`Sending this search link ${search}`);

    bot.sendMessage({
        to: channelID,
        message: `${search}`
    });
    // link = search;


    // request.onload = function() {
    //     gameJson = request.responseText;
    //     console.log(`here is our json ${gameJson}`);
    //     postG2a(gameJson.docs[0].id);
    //     link = link.concat(gameJson.docs[0].slug);


        // bot.sendMessage({
        //     to: channelID,
        //     message: `test`
        // });

    //   }

      
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
