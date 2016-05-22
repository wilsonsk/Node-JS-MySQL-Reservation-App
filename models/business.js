function business(id, name, street_address, city, state, zip, specific_location)
{
    this.id = id;
    this.name = name;
    this.street_address = street_address;
    this.city = city;
    this.state = state;
    this.zip = zip;
    this.specific_location = specific_location;
}

module.exports = business;