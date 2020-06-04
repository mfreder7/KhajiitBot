'use strict';

const fetch = require('node-fetch');
const Discord = require('discord.js');
const logger = require('winston');
const {prefix, token} = require('./auth.json');
const bot = new Discord.Client();

var counter = 0;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});

logger.level = 'debug';
// Initialize Discord Bot


bot.once('ready', () => {
  
  logger.info(`Khajiit has started!`);
});

bot.login(`${token}`);

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  var isTrumpetJoin = true;
  // Search for commands the begin with !
  if (message.content.substring(0, 1) == prefix) {
    var args = message.content.substring(1).split(' ');
    var cmd = args[0];


    // !game - searches g2a/steam and compares prices and displays the result.
    if (cmd == 'game') {
      if (isTrumpetJoin) {
        message.channel.send('*Khajiit has wares, if you have coin...*');
        logger.info(`Request from: ${message.author.id}`);
        counter++;
        getG2a(args, message.channel, message.author.id);
      }
    }
    // !searches - returns 
    else if (cmd == 'searches' && message.author.id == 183986797586546689) {
      if (isTrumpetJoin) {
        message.channel.send( `There has been **${counter}** searches since the last time my owner reset my batteries.`);
      }
    }

  

  else if (cmd == 'servers' && message.author.id == 183986797586546689) {
      if (isTrumpetJoin) {
        message.channel.send(`Server count: ${bot.guilds.cache.size}`);
      }
    }
  }
  
});

/**
 * Searches G2A for the requested game.
 * 
 * @param {*} aSearch - the game that is requested.
 * @param {*} aChannel - - the channel that the request originates from.
 */
async function getG2a(aSearch, aChannel, authorID) {
  var search = "https://www.g2a.com/lucene/search/filter?&search=";
  var searchLink = "https://www.g2a.com/search?___currency=USD&mkey=7m7vq&utm_source=KhajiitBot&utm_medium=price_comparison&utm_campaign=KhajiitBot&query=";
  var found = false;
  
  for (var i = 1; i < aSearch.length; i++) {
    var search = search.concat(aSearch[i], "+");
    var searchLink = searchLink.concat(aSearch[i], "+");
  }
  console.log(`Sending this search link ${search}`);
  const response = await httpGet(search);
  const data = await response.json();
  if (data.docs.length < 1) {
    message.channel.send('No results were returned...');

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

        postG2a(data.docs[i].slug, aChannel, searchLink, authorID);
          found = true;
          break;
        }
    }
    if (!found) {
      postG2a(data.docs[0].slug, aChannel, searchLink, authorID);
    }

  }
}

/**
 * Gets JSON of a specified G2A listing, parses it, then creates an embedded message and
 * sends it to the channel that it was requested at.
 * 
 * @param {string} endUrl - string to append search to the url in order to pull up the game.
 * @param {string} aChannel - channel to send message too.
 * @param {string} searchLink - search link for the embedded message
 */
async function postG2a(endUrl, aChannel, searchLink, authorID) {
  const link = `https://www.g2a.com${endUrl}?___currency=USD&mkey=7m7vq&utm_source=KhajiitBot&utm_medium=price_comparison&utm_campaign=KhajiitBot`;
  const search = `https://www.g2a.com/new/api/v1/products/${endUrl}?currency=USD&store=englishus&wholesale=false`;

  // Fetch's the json data for the game.
  const response = await httpGet(search)
  const data = await response.json();
  const name = data?.info?.name;
  const imageLink = data?.info?.media?.data[0]?.image?.sources[0]?.url;
  const description = data?.info?.meta?.description !== undefined ? data.info.meta.description : data?.info?.shortDescription;

  // Get information from Steam.
  const steamId = data?.info?.attributes?.SteamAppID;
  console.log(`Steam app ID: $${steamId}`);
  const isValidSteamAppOrGame = steamId !== undefined && (data.info.type.name == "Games" || data.info.type.name == "Programs");
  const steamLink = isValidSteamAppOrGame ? `https://store.steampowered.com/app/${steamId}` : "https://store.steampowered.com/search/?term=";
  var steamPrice = isValidSteamAppOrGame ? await getSteam(steamId) : undefined;
  console.log(`Steam Price: $${steamPrice}`);


  // Reduce to the lowest found price.
  var lowPrice = data.offers.items.reduce((accumulator, item) =>
    !item.isG2APlusOffer && item.price.value != null ?
      Math.min(item.price.value, accumulator) :
      accumulator,
    Number.MAX_SAFE_INTEGER);


  // If both Steam and G2A prices exist, print savings.
 
  const hasPrices = lowPrice !== Number.MAX_SAFE_INTEGER && steamPrice !== undefined;
  const savingsPercent = hasPrices ? Math.max(0, Math.floor(100 - 100 * (lowPrice / steamPrice))) : 0;

  if(lowPrice != undefined){
    lowPrice = lowPrice.toFixed(2);
  }
  else if(steamPrice != undefined){
    steamPrice = steamPrice.toFixed(2);
  }

  // Create and send the discord message.
  var embedded = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setURL(link)
    .setDescription(`[See more results...](${searchLink})\n` + description)
    .setThumbnail(imageLink)
    .addFields(
      { name: "G2A", value: (`[$${lowPrice || '----'}](${link})`), inline: true },
      { name: "Steam", value: (`[$${steamPrice || '----'}](${steamLink})`), inline: true },
      { name: "Discount Percentage", value: (`**${savingsPercent || '0'}%!**:fire:`), inline: true },
    )
    .setTimestamp()
    .setFooter('https://ko-fi.com/welovethis', 'https://i.imgur.com/f2r0oyj.png');
    aChannel.send(embedded);
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
  const data = await response.json();
  if (data[steamId]?.success !== true) return undefined;

  // It's free, therefore it's $0.
  if (data[steamId].data.is_free) return 0;

  // It's not free, but it doesn't have a price.
  const { final } = data[steamId].data.price_overview;
  if (isNaN(final)) return undefined;

  return final / 100;
}
