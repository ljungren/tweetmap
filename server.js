var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');
    // twitter_interface = require('./interface');

var config = require('./config.js');
var Twitter = require('twitter-node-client').Twitter;
var twitter = new Twitter(config.twitterApi);

/*Set EJS template Engine*/
app.set('views','./views');
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(
    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        port : 3306, //port mysql
        database : 'tweetmap',
        debug    : false //set true if you wanna see debug logger
    },'request')
);

//RESTful route
var router = express.Router();

router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var api = router.route('/search/');

//show interface | GET
api.get(function(req,res,next){
    
    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT search_string " + 
            "FROM search_history",function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render('search',{title:"Tweetmap",data:rows});

        });
    });
});

//post data to DB | POST
api.post(function(req,res,next){

    //validation
    req.assert('search_string','Search string is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        search_string:req.body.search_string
    };

    var userLocation = null;
    var latLong = null;

    // Get tweets from string
    twitter.getSearch({'q': data.search_string,'count': 20, 'result_type': 'recent'}, function(err, response, body){
        console.log('ERROR, ' + err);
    }, 
    function (searchData) {
        var tweets = JSON.parse(searchData).statuses;
        for(var i=0;i<tweets.length;i++){
            var ul = tweets[i].user.location;
            if(ul!=null || ul!=''){
                // Validate location format
                if(/([A-Z]\w+|[A-Z]\w+\s\w+)\,\s([A-Za-z]\w+)/.test(ul)){
                    userLocation = ul;
                    console.log('userLocation: ' + ul);
                }
            }
        }
        if(userLocation!==null){
            // Retrieve user location
            twitter.getCustomApiCall('/geo/search.json',
                {'query': userLocation}, function(err, response, body){
                console.log('ERROR, ' + err);
            }, 
            function (locData) {
                latLong = JSON.stringify(JSON.parse(locData).result.places[0].bounding_box.coordinates[0][0]);
                console.log('latLong: ' + latLong);

                //save longitude and latitude in database
                req.getConnection(function (err, conn){

                    if (err) return next("Cannot Connect");

                    // Check if search has already been added to db 
                    var query = conn.query("SELECT search_id FROM search_history " +
                        "WHERE search_string = '" + data.search_string + "';", function(err, rows){

                        if(err){
                            console.log(err);
                            return next("Mysql error, check your query");
                        }
                        else if(rows.length > 0){
                            res.sendStatus(200);
                        }
                        else{
                                
                            // Add to db
                            var query = conn.query("INSERT INTO search_history (search_string, location) " +
                                "VALUES ('" + data.search_string + "', '" + latLong + "');", function(err, rows){

                                if(err){
                                    console.log(err);
                                    return next("Mysql error, check your query");
                                }
                                res.redirect('/api/map/'+data.search_string);
                            });
                        }
                    });
                });
            });
        }
        else{
            console.log('No location found');
        }
    });
});

//now for map route
var api2 = router.route('/map/:search_string');

api2.all(function(req,res,next){
    //console.log("You want to do smth about api2 Route ? Do it here");
    //console.log(req.params);
    next();
});

//get map with location
api2.get(function(req,res,next){

    var search_string = req.params.search_string;

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT location " + 
            "FROM search_history " + 
            "WHERE search_string = '" + search_string + "';", function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }
            if(rows.length < 1)
                return res.send("No data found");

            res.render('map',{title:"Tweetmap", data:rows, search_string: search_string, key:config.mapsApiKey});
        });

    });

});

//now we need to apply our router here
app.use('/api', router);

//start Server
var server = app.listen(8000,function(){

   console.log("Listening to port %s",server.address().port);

});

