var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/swag-shop');

var Product = require('./model/product');
var WishList = require('./model/wishlist');

//Allow all requests from all domains & localhost
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.post('/product', async (request, response) => {
    try {
        const product = new Product({
            title: request.body.title,
            price: request.body.price,
        });

        const savedProduct = await product.save();
        response.status(201).send(savedProduct);
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send({ error: "Could not save product" });
    }
});

// Get all products
app.get('/product', async (request, response) => {
    try {
        const products = await Product.find({});
        response.send(products);
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send({ error: "Could not fetch products" });
    }
});

// Get all wishlists
app.get('/wishlist', async (request, response) => {
    try {
        const wishLists = await WishList.find({}).populate({ path: 'products', model: 'Product' });
        response.status(200).send(wishLists);
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send({ error: "Could not fetch wishlists" });
    }
});

// Create a wishlist
app.post('/wishlist', async (request, response) => {
    try {
        const wishList = new WishList({ title: request.body.title });
        const newWishList = await wishList.save();
        response.send(newWishList);
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send({ error: "Could not create wishlist" });
    }
});

// Add a product to a wishlist
app.put('/wishlist/product/add', async (request, response) => {
    try {
        const product = await Product.findOne({ _id: request.body.productId });
        const updatedWishList = await WishList.updateOne({ _id: request.body.wishListId }, { $addToSet: { products: product._id } });
        response.send("Successfully added to wishlist");
    } catch (error) {
        console.error('Error:', error.message);
        response.status(500).send({ error: "Could not add item to wishlist" });
    }
});

app.listen(3004, function() {
    console.log("Swag Shop API running on port 3004...");
});
