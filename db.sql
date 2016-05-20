
drop table if exists `food`;
drop table if exists `business`;
drop table if exists `food_business`;

create table 'food' (
'id' int not null auto_increment,
'type' varchar(255),
'quantity' unsigned float,
'availability_start' datetime,
'availability_end' datetime,
primary key ('id')
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

create table 'business' (
'id' int not null auto_increment,
'name' varchar(255),
'street_address' varchar(255),
'city' varchar(255),
'state' varchar(32),
'zip' unsigned tinyint,
'specific_location' varchar(255),
primary key (id)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

create table 'food_business' (
'fk_food_id' int,
'fk_business_id' int,
foreign key (fk_food_id) references food(id) on delete cascade on update cascade,
foreign key (fk_business_id) references business(id) on delete cascade on update cascade
) ENGINE = InnoDB DEFAULT CHARSET=utf8;


insert into food ('type', 'quantity', 'availability_start', 'availability_end') values
("bread", "42.2", "2016-05-31 05:30:00", "2016-05-31 07:30:00");

insert into business ('name', 'street_address', 'city', 'state', 'zip', 'specific_location') values
("Joe Blow's Dough", "2341 Who Cares", "Springville", "Illinois", "98765", "Around the back");

select * from food;
select * from business;
select * from food_business;
select name from business b inner join food_business on b.id = fb.fk_business_id where (select availability_start from food f inner join food_business fb on food.id = fk_food_id where availability_start < "2016-06-1 07:00:00");