'use strict';



const fetch = require("node-fetch");
const Discord = require('discord.io');
const Disc2 = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var counter = 0;
var isTrumpetJoin = true;

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
    // Search for commands the begin with !
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

            // !trumpetJoin - toggle the bot (on without needing to exit). Default value = true.
            if (cmd == 'trumpetJoin'){
                bot.sendMessage({
                    to: channelID,
                    message: 'Your wish is my command.'
                });
                isTrumpetJoin = true;
            }

                // !trumpeLeave - toggle the bot (off without needing to exit)
            else if (cmd == 'trumpetLeave'){
                bot.sendMessage({
                    to: channelID,
                    message: 'Your wish is my command.'
                });
                isTrumpetJoin = false;
            }

            // !game - searches g2a/steam and compares prices and displays the result.
            else if (cmd == 'game'){
                if(isTrumpetJoin){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Now searching...'
                    });
                    counter++;
                    getG2a(args, channelID);
                }
            }
            // !searches - returns 
            else if (cmd == 'searches'){
                if(isTrumpetJoin){
                    bot.sendMessage({
                        to: channelID,
                        message: `There has been **${counter}** searches since the last time my owner reset my batteries.`
                    });
                }
        }
        
    }
});

/**
 * Searches G2A for the requested game.
 * 
 * @param {*} aSearch - the game that is requested.
 * @param {*} channelID - - the channel that the request originates from.
 */
async function getG2a(aSearch, channelID) {
    var search = "https://www.g2a.com/lucene/search/filter?&search=";
    var searchLink = "https://www.g2a.com/search?query=";

    for (var i = 1; i < aSearch.length; i++ ) {
        var search = search.concat(aSearch[i],"+");
        var searchLink = searchLink.concat(aSearch[i],"+");
    }
        console.log(`Sending this search link ${search}`);
        await fetch(search, {
            "headers": {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "accept-language": "en-US,en;q=0.9,es;q=0.8",
              "cache-control": "max-age=0",
              "if-none-match": "W/\"39cb-y0/pPPzKTKRWAhFbiCnvNg\"",
              "sec-fetch-dest": "document",
              "sec-fetch-mode": "navigate",
              "sec-fetch-site": "none",
              "sec-fetch-user": "?1",
              "upgrade-insecure-requests": "1",
            },
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors"
          }).then((resp) => resp.json())
          .then(function(data) {

            if(data.docs.length == 0){
                bot.sendMessage({
                    to: channelID,
                    message: 'No results were returned...'
                });

            } else {
                for(var i = 0; i < data.docs.length; i++) {
                    
                    /**FUTURE IMPLEMENTATION
                     * Place if statements to check for different countries based on user.
                     * 
                     * Currently set to: NA
                     * 
                     */
                    if (data.docs[i].name.includes("GLOBAL") || data.docs[i].name.includes("UNITED STATES") ||  data.docs[i].name.includes("NORTH AMERICA")){
                        // console.log("name = " + data.docs[i].name);
                        // console.log("id = " + data.docs[i].id);
                        // console.log("catalog id = " + data.docs[i].catalogId);
                        // console.log("end URL = " + data.docs[i].slug);
                        
                        postG2a(data.docs[i].slug, channelID, searchLink);
                        break;
                    }
                }
            }
        })
}

/**
 * Gets JSON of a specified G2A listing, parses it, then creates an embedded message and
 * sends it to the channel that it was requested at.
 * 
 * @param {*} endUrl - string to append search to the url in order to pull up the game.
 * @param {*} channelID - channel to send message too.
 * @param {*} searchLink - search link for the embedded message
 */
async function postG2a(endUrl, channelID, searchLink){
    var link = "https://www.g2a.com";
    var search = "https://www.g2a.com/new/api/v1/products/";
    var endSearch = "?currency=USD&store=englishus&wholesale=false";
    var name;
    var description;
    var steamPrice;
    var steamLink;
    var imageLink;
    var lowPrice;
    var savingsPercent;
    // var savings;
    // var release;


    search = search.concat(endUrl, endSearch);
    link = link.concat(endUrl, "?reflink=user-5eb3514e7df30");

    //fetch's the json data for the game.
    await fetch(search, {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:76.0) Gecko/20100101 Firefox/76.0",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json"
    },
    "referrer": `${link}`,
    "method": "GET",
    "mode": "cors"
        }).then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            name = data.info.name;

            if(data.info.meta.description != null){
                description = data.info.meta.description;
            } else{
                description = data.info.shortDescription;
            } if(data.info.attributes.SteamAppID != null){
                steamLink = "https://store.steampowered.com/app/" + data.info.attributes.SteamAppID;
                if(data.info.attributes.steamprice!= null){
                    steamPrice = data.info.attributes.steamprice;
                } else {
                    steamPrice = "----";
                }
            } else{
                steamLink = "https://store.steampowered.com/search/?term=";
                steamPrice = "----";
            }

            // release = data.info.attributes.ReleaseDate;
            imageLink = data.info.media.data[0].image.sources[0].url;

                for(var i = 0; i < data.offers.items.length; i++){
                    if (data.offers.items[i].isG2APlusOffer == false){
                        if (data.offers.items[i].price.value != null){
                            lowPrice = data.offers.items[i].price.value;
                            break;
                        } else {
                            lowPrice = "----";
                        }
                        
                    }
                }
            
           
            if(isNaN(lowPrice) == false) {
                lowPrice = lowPrice.toFixed(2);
            } else {
                lowPrice = "----";
                savingsPercent = 100;
            }
            
            if (isNaN(steamPrice) == false){
                steamPrice = steamPrice.toFixed(2);
                // savings = steamPrice - lowPrice;
                if(isNaN(lowPrice) == false) {
                    savingsPercent = (lowPrice/steamPrice)*100;
                }
                
            } else{
                savingsPercent = 100;
            }

        savingsPercent = savingsPercent.toFixed(0);
            // console.log("Title = " + name);
            // console.log("Description = " + description);
            // console.log("Release date = " + release);
            // console.log("Image Link = " + imageLink);
            // console.log("Steam Link = " + steamLink);
            // console.log("Steam Price = $" + steamPrice.toFixed(2));
            // console.log("G2A Price (lowest) = $" + lowPrice.toFixed(2));
            // console.log("Savings = $" + savings.toFixed(2));
            // console.log("Savings Percentage = " + savingsPercent.toFixed(0) +"%!");

            //creates our embeded discord messge
            var embedded = new Disc2.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(name)
                .setURL(link)
                .setDescription(`[See more results...](${searchLink})\n` + description)
                .setThumbnail(imageLink)
                .addFields(
                    { name: "G2A", value: (`[$${lowPrice}](${link})`), inline: true },
                    { name: "Steam", value: (`[$${steamPrice}](${steamLink})`), inline: true },
                    { name: "Discount Percentage", value: ("**" + (100-savingsPercent) + "%!**:fire:"), inline: true },
                )
                .setTimestamp()
                .setFooter('Created by Michael Frederic', 'https://i.imgur.com/lBui3jx.png');

                bot.sendMessage({
                    to: channelID,
                    embed: embedded
                });

  
  });

}
