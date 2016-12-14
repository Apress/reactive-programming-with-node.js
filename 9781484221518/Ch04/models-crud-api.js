var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//------- Address ---------

var addressSchema = Schema({
	street_name: String,
	house_number: Number,
	city: String,
	phone_number: String
});

var addressModel = mongoose.model('Address', addressSchema);

//--------- User ---------------

var usersSchema = Schema({
	first_name: {
		type: String,
		required: true
	},
	last_name: {
		type: String,
		required: true
	},
	birth_date: Date,
	addresses: [ 
	{	
		ref: 'Address',
		type: Schema.Types.ObjectId
	}],
	userame: String,
	password: String
});

var usersModel = mongoose.model('User', usersSchema);

module.exports = {
	users: usersModel,
	addresses: addressModel
}