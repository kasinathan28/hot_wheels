// productModel.js
const mongoose = require('mongoose');

// Define the product schema
// productModel.js
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  priceId: {
    type: String,
    required: false, 
  },
  image: String,
  quantity: String,
});


// Create the 'Product' model
const Product = mongoose.model('Product', productSchema);

// Export the Product model
module.exports = Product;
