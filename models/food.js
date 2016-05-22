function food(id, type, quantity, availability_start, availability_end)
{
    this.id = id;
    this.type = type;
    this.quantity = quantity;
    this.availability_start = availability_start;
    this.availability_end = availability_end;
}

module.exports = food;