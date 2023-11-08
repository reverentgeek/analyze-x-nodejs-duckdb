# Analyze Your X (Twitter) Data with Node.js and DuckDB

This project was created for the blog post, [Analyze Your X (Twitter) Data with Node.js and DuckDB](https://motherduck.com/blog/analyze-x-data-nodejs-duckdb/). It's a tool for converting your X archive data to comma-separated values (CSV) using Node.js and analyzing that data with DuckDB. Go read the post, or explore the code here!

Learn how to [download your X data](https://help.twitter.com/en/managing-your-account/accessing-your-x-data) on the X Help Center.

## Requirements

* [Download your X data archive.](https://help.twitter.com/en/managing-your-account/accessing-your-x-data) Your request may take 24 hours or more to process.
* Install [Node.js version 18 or higher.](https://nodejs.org/)
* Install [DuckDB](https://duckdb.org/).

> Note: You can use DuckDB in a Node.js application with the [duckdb-async](https://www.npmjs.com/package/duckdb-async) library without having to install the DuckDB app. However, you may want the standalone app to run your queries against the converted data (see _Next steps_ below).

## Setup

1. Clone or download and extract this repository.
2. Open the project in your terminal or console, and run `npm install` to install dependencies.
3. Extract (unzip) your X archive and copy or move the files into the project folder named `x-archive`. The `x-archive` folder should now look like the following:

```sh
|__ x-archive
    |__ assets
    |__ data
    |__ readme.md
    |__ Your archive.html
```

## Run the app

From your terminal or command window, make sure your current directory is the project folder. Run the following command:

```sh
node .
```

After a few processing steps, you should see the output of basic analysis and stats on your X posts.

## Next steps

If you're comfortable with JavaScript, you can directly modify `src/duckdb.js` to customize or add new SQL queries.

If you know SQL (or want to learn!), use the [DuckDB](https://duckdb.org/) CLI app against the exported data. You'll find that data in the `src/data` folder as CSV files. From your terminal, you can run the `duckdb` app and query the exported CSV data directly.

### DuckDB example

Run each of these statements one at a time from your terminal.

```sh
> duckdb
D CREATE TABLE tweets AS SELECT * FROM 'src/data/tweets.csv';
D DESCRIBE tweets;
D SELECT count(*) AS total_posts FROM tweets;
```

You can query directly against CSV files. However, the above `CREATE TABLE` statement creates a temporary table in memory that you can query against. `DESCRIBE tweets` will output the columns of that table so you can get an idea of what queries you may want to run.
