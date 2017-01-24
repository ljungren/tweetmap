#Tweetmap

Show on a map where the latest tweet of a specified word was published. Using Twitter API and Google maps API.

## Installation

    npm install

## Configuration 

### Database

Create a mysql database named 'tweetmap' with this table (db.sql):

      SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

      CREATE TABLE IF NOT EXISTS `search_history` (
        `search_id` int(11) NOT NULL AUTO_INCREMENT,
        `search_string` varchar(100) NOT NULL,
        `location` varchar(100) NOT NULL,
        PRIMARY KEY (`search_id`)
      );

configure your db specs in server.js:

      host: 'localhost',
      user: 'root',
      password : 'root',
      port : 3306, //port mysql
      database:'tweetmap'	

### Twitter and Google Maps

Register your application and create a config.js:
      
      {
        mapsApiKey: '...',
        twitterApi: {
          consumerKey: "...",
          consumerSecret: "...",
          accessToken: "...",
          accessTokenSecret: "...",
          callBackUrl: "..."
        }
      }

## Serve
    
    node server.js

#### Access:

    http://localhost:8000/api/search/
