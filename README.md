#Tweetmap

Show on a map where the latest tweet of a specified subject was published. Using Twitter API and Google maps API.

## Installation

    npm install

## Configuration (database)
server.js

      host: 'localhost',
      user: 'root',
      password : 'root',
      port : 3306, //port mysql
      database:'tweetmap'	

## Serve
    
    node server.js

access:

    http://localhost:3000/
