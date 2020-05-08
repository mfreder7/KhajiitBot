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
    var search = "https://www.g2a.com/lucene/search/filter?jsoncallback=jQuery111002521088376353553_1491736907010&skip=28837%2C28838%2C28847%2C28849%2C28852%2C28856%2C28857%2C28858%2C28859%2C28860%2C28861%2C28862%2C28863%2C28867%2C28868%2C28869%2C29472%2C29473%2C29474%2C29475%2C29476%2C29482%2C29486%2C33104&minPrice=0.00&maxPrice=640.00&cn=&kr=&stock=all&event=&platform=0&search=Grid+2";
    var link = "https://www.g2a.com";

    
    // var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // let request = new XMLHttpRequest();
    var gameJson;
    var id = 0;

    for (var i = 1; i < aSearch.length; i++ ) {
        var search = search.concat(aSearch[i],"+");
    }

    try {
        console.log(`Sending this search link ${search}`);
        await driver.get('https://selenium.dev');
        console.log(`trolololol debug`);
        
        // (await driver).get(search);
        
        

    }
    catch (error) {
        // Navigate to Url
        await  driver.quit();

    }
    finally{
        await  driver.quit();
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
