const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Assuming a basic email format
  },
  address: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200,
  },
  city: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  zipCode: {
    type: String,
    match: /^[0-9]{5}$/, // Corrected match pattern for a 5-digit ZIP code
  },
  phoneNumber: {
    type: String,
    match: /^[0-9]{10}$/, // Corrected match pattern for a 10-digit phone number
  },
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
