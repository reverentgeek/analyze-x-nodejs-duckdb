import duckdb from "duckdb-async";

export async function analyzePosts( csvFilePath ) {
  try {
    // Create an instance of DuckDB using in-memory storage
    const db = await duckdb.Database.create( ":memory:" );

    await topRetweets( db, csvFilePath );
    await topFavorites( db, csvFilePath );
    await postStats( db, csvFilePath );

  } catch ( err ) {
    console.log( "Uh oh! There's an error!" );
    console.log( err );
  }
}

async function topRetweets( db, csvFilePath ) {
  const topRetweets = await db.all( `
  SELECT full_text, 
    created_at_date + created_at_time AS created_at, 
    retweet_count,
    link
  FROM read_csv_auto( '${ csvFilePath }' )
  ORDER BY retweet_count DESC
  LIMIT 3;` );

  console.log( "\nTop Retweets!\n" );
  console.log( topRetweets );
}

async function topFavorites( db, csvFilePath ) {
  const topFavorites = await db.all( `
  SELECT full_text, 
    created_at_date + created_at_time AS created_at, 
    favorite_count,
    link 
  FROM read_csv_auto( '${ csvFilePath }' )
  ORDER BY favorite_count DESC
  LIMIT 3;` );

  console.log( "\nTop Favorites!\n" );
  console.log( topFavorites );
}

async function postStats( db, csvFilePath ) {
  const totalPosts = await db.all( `
  SELECT count(*) AS total_posts
  FROM read_csv_auto( '${ csvFilePath }' )
  WHERE is_reply = 0;` );

  const totalReplies = await db.all( `
  SELECT count(*) AS total_replies
  FROM read_csv_auto( '${ csvFilePath }' )
  WHERE is_reply = 1;` );

  const postsByDay = await db.all( `
  SELECT dayname(created_at_date) as day_of_the_week, 
    count(*) AS posts_and_replies
  FROM read_csv_auto( '${ csvFilePath }' )
  GROUP BY dayname(created_at_date)
  ORDER BY 2 DESC;` );

  const postsByMonthYear = await db.all( `
  SELECT monthname(created_at_date) as month,
    datepart('year', created_at_date) as year,
    count(*) AS posts
  FROM read_csv_auto( '${ csvFilePath }' )
  GROUP BY 1, 2
  ORDER BY 3 DESC
  LIMIT 10;` );

  console.log( "\nTotal posts and replies\n" );
  console.log( totalPosts, totalReplies );
  console.log( "\nMost active days\n" );
  console.log( postsByDay );
  console.log( "\nMost active months\n" );
  console.log( postsByMonthYear );
}

