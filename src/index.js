import * as fs from "node:fs/promises";
import { join, resolve } from "node:path";
import { stringify } from "csv-stringify";

async function fileExists( filePath ) {
  try {
    await fs.stat( filePath );
    return true;
  } catch {
    return false;
  }
}

async function readXFile( xfilePath, objectName ) {
  // The X data assumes running the browser and
  // directly assigns data to the browser's window object
  // So, we have to spoof the global window in Node.js
  // to load this JS file.
  if ( !global.window ) {
    global.window = {
      YTD: {}
    };
  }
  global.window.YTD[objectName] = {};
  await import( xfilePath );
  const data = global.window.YTD[objectName].part0;
  delete global.window; // free up the memory
  return data;
}

async function convertTweetsToJSON( jsPath, jsonPath ) {
  try {
    const tweets = await readXFile( jsPath, "tweets" );
    await fs.writeFile( jsonPath, JSON.stringify( tweets, null, 2 ), { encoding: "utf-8" } );
  } catch( err ) {
    console.log( "Error reading or writing tweets" );
    console.log( err );
  }
}

async function readJSON( jsonPath ) {
  try {
    const contents = await fs.readFile( jsonPath, { encoding: "utf-8" } );
    const tweets = JSON.parse( contents );
    return tweets;
  } catch ( err ) {
    console.log( "Error reading tweets" );
    console.log( err );
    return null;
  }
}

async function flattenTweets( jsonPath, flatPath, account ) {
  try {
    const htmlRegEx = /<[^>]*>/gi;
    const tweets = await readJSON( jsonPath );
    if ( tweets ) {
      const mapped = tweets.map( ( { tweet: t } ) => {
        return {
          id: t.id,
          favorite_count: t.favorite_count,
          retweet_count: t.retweet_count,
          created_at: t.created_at,
          is_reply: t.in_reply_to_user_id?.length > 0,
          in_reply_to_user_id: t.in_reply_to_user_id ?? 0,
          is_self_reply: t.in_reply_to_user_id === account.accountId,
          retweet: t.full_text ? t.full_text.startsWith( "RT " ) : false,
          has_media: t.entities?.media?.length > 0,
          hashtags: t.entities?.hashtags?.length ?? 0,
          user_mentions: t.entities?.user_mentions?.length ?? 0,
          urls: t.entities?.urls?.length ?? 0,
          source: t.source ? t.source.replaceAll( htmlRegEx, "" ) : "",
          full_text: t.full_text
        };
      } );
      const mappedText = JSON.stringify( mapped, null, 2 );
      await fs.writeFile( flatPath, mappedText, { encoding: "utf-8" } );
    }
  } catch( err ) {
    console.log( "Error mapping tweets" );
    console.log( err );
  }
}

async function convertToCSV( flatPath, csvPath ) {
  try {
    const tweets = await readJSON( flatPath );
    const csv = stringify( tweets, { header: true } );
    await fs.writeFile( csvPath, csv, { encoding: "utf-8" } );
  } catch ( err ) {
    console.log( "Error creating csv file" );
    console.log( err );
  }
}

async function main() {
  const xPath = resolve( join( ".", "x-archive", "data" ) );
  const accountPath = join( xPath, "account.js" );
  const jsPath = join( xPath, "tweets.js" );
  const jsonPath = resolve( join( ".", "src", "data", "tweets.json" ) );
  const flatPath = resolve( join( ".", "src", "data", "flattened_tweets.json" ) );
  const csvPath = resolve( join( ".", "src", "data", "tweets.csv" ) );

  const accountData = await readXFile( accountPath, "account" );
  const account = accountData[0].account;

  const tweetJsonExists = await fileExists( jsonPath );
  if ( !tweetJsonExists ) {
    console.log( "Converting X posts to JSON..." );
    await convertTweetsToJSON( jsPath, jsonPath );
  }

  const mapExists = await fileExists( flatPath );
  if ( !mapExists ) {
    console.log( "Flattening objects..." );
    await flattenTweets( jsonPath, flatPath, account );
  }

  const csvExists = await fileExists( csvPath );
  if ( !csvExists ) {
    console.log( "Writing csv file..." );
    await convertToCSV( flatPath, csvPath );
  }
}

main();

