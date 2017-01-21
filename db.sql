/* Create local mysql database 'tweetmap' with this table */

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE TABLE IF NOT EXISTS `search_history` (
  `search_id` int(11) NOT NULL AUTO_INCREMENT,
  `search_string` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  PRIMARY KEY (`search_id`)
);
