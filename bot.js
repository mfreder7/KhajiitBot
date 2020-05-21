'use strict';



const fetch = require("node-fetch");
const Discord = require('discord.io');
const Disc2 = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json');
var counter = 0;

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
  var isTrumpetJoin = true;
  // Search for commands the begin with !
  if (message.substring(0, 1) == '!') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    // !trumpetJoin - toggle the bot (on without needing to exit). Default value = true.
    if (cmd == 'trumpetJoin') {
      bot.sendMessage({
        to: channelID,
        message: 'Your wish is my command.'
      });
      isTrumpetJoin = true;
    }

    // !trumpeLeave - toggle the bot (off without needing to exit)
    else if (cmd == 'trumpetLeave') {
      bot.sendMessage({
        to: channelID,
        message: 'Your wish is my command.'
      });
      isTrumpetJoin = false;
    }

    // !game - searches g2a/steam and compares prices and displays the result.
    else if (cmd == 'game') {
      if (isTrumpetJoin) {
        bot.sendMessage({
          to: channelID,
          message: '*Khajiit has wares, if you have coin...*'
        });
        counter++;
        getG2a(args, channelID);
      }
    }
    // !searches - returns 
    else if (cmd == 'searches') {
      if (isTrumpetJoin) {
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
  var found = false;

  for (var i = 1; i < aSearch.length; i++) {
    var search = search.concat(aSearch[i], "+");
    var searchLink = searchLink.concat(aSearch[i], "+");
  }
  console.log(`Sending this search link ${search}`);
  const response = await httpGet(search);
  const data = response.json();
  if (data.docs.length == 0) {
    bot.sendMessage({
      to: channelID,
      message: 'No results were returned...'
    });

  } else {
    for (var i = 0; i < data.docs.length; i++) {

      /**FUTURE IMPLEMENTATION
       * Place if statements to check for different countries based on user.
       * 
       * Currently set to: NA
       * 
       */
      if (data.docs[i].name.includes("GLOBAL") || data.docs[i].name.includes("UNITED STATES") || data.docs[i].name.includes("NORTH AMERICA")) {
        // console.log("name = " + data.docs[i].name);
        // console.log("id = " + data.docs[i].id);
        // console.log("catalog id = " + data.docs[i].catalogId);
        // console.log("end URL = " + data.docs[i].slug);

        postG2a(data.docs[i].slug, channelID, searchLink);
        found = true;
        break;
      }
    }
    if (!found) {
      postG2a(data.docs[0].slug, channelID, searchLink);
    }

  }
}

/**
 * Gets JSON of a specified G2A listing, parses it, then creates an embedded message and
 * sends it to the channel that it was requested at.
 * 
 * @param {string} endUrl - string to append search to the url in order to pull up the game.
 * @param {string} channelID - channel to send message too.
 * @param {string} searchLink - search link for the embedded message
 */
async function postG2a(endUrl, channelID, searchLink) {
  const link = `https://www.g2a.com/${endUrl}?reflink=user-5eb3514e7df30`;
  const search = `https://www.g2a.com/new/api/v1/products/${endUrl}?currency=USD&store=englishus&wholesale=false`;

  // Fetch's the json data for the game.
  const response = await httpGet(search)
  const data = response.json();
  const name = data?.info?.name;
  const imageLink = data?.info?.media?.data[0]?.image?.sources[0]?.url;
  const description = data?.info?.meta?.description !== undefined ? data.info.meta.description : data?.info?.shortDescription;

  // Get information from Steam.
  const steamId = data?.info?.attributes?.SteamAppID;
  console.log(`Steam app ID: $${steamId}`);
  const isValidSteamAppOrGame = steamId !== undefined && (data.info.type.name == "Games" || data.info.type.name == "Programs");
  const steamLink = isValidSteamAppOrGame ? `https://store.steampowered.com/app/${steamId}` : "https://store.steampowered.com/search/?term=";
  const steamPrice = isValidSteamAppOrGame ? await getSteam(steamId) : undefined;
  console.log(`Steam Price: $${steamPrice}`);

  // Reduce to the lowest found price.
  const lowPrice = data.offers.items.reduce((accumulator, item) =>
    !item.isG2APlusOffer && item.price.value != null ?
      Math.min(item.price.value, accumulator) :
      accumulator,
    Number.MAX_SAFE_INTEGER);

  // If both Steam and G2A prices exist, print savings.
  const hasPrices = lowPrice !== Number.MAX_SAFE_INTEGER && steamPrice !== undefined;
  const savingsPercent = hasPrices ? Math.max(0, Math.floor(100 * (lowPrice / steamPrice))) : 0;

  // Create and send the discord message.
  var embedded = new Disc2.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setURL(link)
    .setDescription(`[See more results...](${searchLink})\n` + description)
    .setThumbnail(imageLink)
    .addFields(
      { name: "G2A", value: (`[$${lowPrice}](${link})`), inline: true },
      { name: "Steam", value: (`[$${steamPrice}](${steamLink})`), inline: true },
      { name: "Discount Percentage", value: ("**" + (100 - savingsPercent) + "%!**:fire:"), inline: true },
    )
    .setTimestamp()
    .setFooter('https://ko-fi.com/welovethis', 'https://i.imgur.com/f2r0oyj.png');
  bot.sendMessage({
    to: channelID,
    embed: embedded
  });
}

/** HTTP GETs a URL as-if a user on a web browser was requesting it. */
async function httpGet(url) {
  return await fetch(url, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9,es;q=0.8",
      "cache-control": "max-age=0",
      "if-modified-since": "Tue, 12 May 2020 17:00:00 GMT",
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
  });
}

/**
 * Gets a game price from Steam.
 * @param {string} steamId - the game id that is requested.
 * @returns {*} - price of the game on steam
 */
async function getSteam(steamId) {
  const steamLink = `https://store.steampowered.com/api/appdetails?appids=${steamId}`;
  console.log(`HTTP GET Steam URL ${steamLink}`);

  const response = await httpGet(steamLink);
  // If the server returned an error, we cannot get the price.
  if (!response.ok) return undefined;
  const data = response.json();
  if (data[steamId]?.success !== true) return undefined;

  // It's free, therefore it's $0.
  if (data[steamId].data.is_free) return 0;

  // It's not free, but it doesn't have a price.
  const { final } = data[steamId].data.price_overview;
  if (isNaN(final)) return undefined;

  return final / 100;
}
