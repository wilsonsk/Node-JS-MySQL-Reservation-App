drop table if exists `food`;
drop table if exists `business`;

CREATE TABLE `food` (
	`id` INT PRIMARY KEY AUTO_INCREMENT,
	`bid` INT NOT NULL,
	`type` VARCHAR(255) NOT NULL,
	`quantity` INT UNSIGNED NOT NULL,
	`availability_start` DATETIME NOT NULL,
	`availability_end` DATETIME NOT NULL,
	FOREIGN KEY (bid) REFERENCES business(id) ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `business` (
	`id` INT PRIMARY KEY AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`street_address` VARCHAR(255) NOT NULL,
	`city` VARCHAR(255) NOT NULL,
	`state` CHAR(2) NOT NULL,
	`zip` VARCHAR(5) NOT NULL,
	`specific_location` VARCHAR(255)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;


insert into business (`name`, `street_address`, `city`, `state`, `zip`, `specific_location`) values
("Joe Blow`s Dough", "2341 Who Cares", "Springville", "Illinois", "98765", "Around the back");

insert into food (`type`, `bid`, `quantity`, `availability_start`, `availability_end`) values
("bread", 1, "42.2", "2016-05-31 05:30:00", "2016-05-31 07:30:00");

select * from food;
select * from business;

select name from business b inner join food_business on b.id = fb.fk_business_id where (select availability_start from food f inner join food_business fb on food.id = fk_food_id where availability_start < "2016-06-1 07:00:00");