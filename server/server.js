// Import necessary modules and set up Express app
const UsersModel = require("./models/users"); // Note the lowercase 'users.js'
const Product = require("./models/products"); // Adjust the path as needed
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer"); // Import Multer
const path = require("path"); // Import the 'path' module
const cors = require("cors");
require("dotenv").config(); // Load environment variables
require("./db/connection"); // Connect to the database
const Booking = require ( "./models/bookings" );
const twilio = require("twilio");




const port = process.env.PORT || 5000;

// Load environment variables
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Connect to MongoDB using the connection string from your .env file
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a sample route
app.get("/", (req, res) => {
  res.send("Success..!");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Assign a unique name to the uploaded file
  },
});

const upload = multer({ storage });

// Create a new product with image upload
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, priceId } = req.body;
    const image = req.file; // Access the uploaded image

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const product = new Product({
      name,
      description,
      price,
      priceId,
      image: image.filename, // Store the filename in the 'image' field
    });

    await product.save();


    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone, state, pincode, country } = req.body;
    // Check if the user already exists (based on email)
    const existingUser = await UsersModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create a new user
    const user = new UsersModel({
      username,
      email,
      password,
      phone,
      state,
      pincode,
      country,
    });

    // If a profile picture was uploaded, store its path
 
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: 'Internal server error' });
  }
});







// API endpoint to send OTP
app.post("/sendOTP", async (req, res) => {
  const accountSid = "ACe3e8a0c5012984c57f28389d766dc89d";
  const authToken = "aaf04779563a61e1aab0e4acf9d07abf";
  // Create a Twilio client
  const client = twilio(accountSid, authToken);
  const { phoneNumber } = req.body;
  console.log(req.body);

  try {
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Include +91 in the phone number
    const formattedPhoneNumber = `+91${phoneNumber}`;

    // Send the OTP using Twilio's Messaging API
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "+18083536054",
      to: formattedPhoneNumber, // Include +91
    });

    console.log("OTP sent successfully");
    res.json({ success: true, otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});



// loign endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists based on the email
  const user = await UsersModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  // Check if the provided password matches the user's password
  if (password === user.password) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// new products
// Create a new product
app.post("/products", async (req, res) => {
  try {
    const { name, description, price, image, priceId } = req.body;

    // Create a new product instance using the Product model
    const product = new Product({
      name,
      description,
      price,
      image,
      quantity,
      priceId,
    });

    // Save the product to the database
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to get all available products
app.get("/products", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// deleting product from the database
app.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete the product from the database
    await Product.findByIdAndRemove(productId);

    res.status(204).send(); // Respond with a 204 status (No Content) on successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// fetching the product to edit
app.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    // Fetch the product from the database using the provided productId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, priceId, quantity } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(productId, {
      name,
      description,
      price,
      priceId,
      quantity,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



const stripe = require("stripe")(
  "sk_test_51O1DHFSENxkdHNp7UIpMFr6JFZF1OVYrY60cdGCby6oe2DZeJKEjEEmz0YzzNALoLXrKKEdUuGhsY2Z7M3wiH1cj00iivjlrVM"
);

app.post("/create-checkout-session", async (req, res) => {
  const { product, priceId, quantity } = req.body; // Modify this to match your data structure

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/Success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/checkout",
    });

    // Retrieve the Payment Intent ID from the session
    const paymentIntentId = session.payment_intent;
    console.log(paymentIntentId);
    
    res.json({ url: session.url, paymentIntentId: paymentIntentId });
    
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Session creation failed" });
  }
});





// booking database
app.post("/new-booking", async (req, res) => {
  const { productId,productName, price,userName, shippingAddress } = req.body;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity > 0) {
      // Decrease the quantity by 1
      product.quantity--;

      // Save the updated product with reduced quantity
      await product.save();

      // Create a new booking record
      const booking = new Booking({
        productId,
        productName,
        price,
        userName,
        shippingAddress,
        bookingDate: new Date(),
      });

      await booking.save();

      res.status(201).json({ message: "Product booked and quantity updated" });
    } else {
      res.status(400).json({ error: "Product is out of stock" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Define a route to fetch booking data
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching booking data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



  // fetching products to cart
  // app.get("/cart/:username", async (req, res) => {
  //   try {
  //     const username = req.params.username; // Get the username from the URL parameter
  
  //     console.log("Received request for username: " + username);
  
  //     // Fetch all bookings that match the provided username
  //     const bookings = await Booking.find({ username });
  
  //     console.log("Found bookings:", bookings);
  
  //     if (bookings.length === 0) {
  //       console.log("No bookings found for this user.");
  //       return res.status(404).json({ message: "No bookings found for this user" });
  //     }
      
  //     console.log("Sending bookings data in response.");
  //     res.status(200).json(bookings);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });
  



  app.get('/cart/:username', async (req, res) => {
    try {
      const username = req.params.username;
  
      // Use the Mongoose model to find all bookings with the provided username
      const bookings = await Booking.find({ userName: username });
  
      if (bookings.length === 0) {
        return res.status(404).json({ message: 'No bookings found for this user' });
      }
  
      res.status(200).json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  
// API route to cancel an order and issue a refund
app.post('/cancel-booking/:bookingId', async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
    // Retrieve the booking details from your database using the orderId.
    const booking = await Booking.findById(orderId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the payment intent or payment method ID is present in the booking.
    if (!booking.stripePaymentIntentId) {
      return res.status(400).json({ error: 'Payment intent not found in booking' });
    }

    // Use the Stripe API to refund the payment.
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
    });

    // Handle the refund status and update the booking status in your database.
    if (refund.status === 'succeeded') {
      // Update the booking status to "canceled" or a suitable status in your database.
      await Booking.findByIdAndUpdate(orderId, { status: 'canceled' });

      return res.status(200).json({ message: 'Order canceled and refunded successfully' });
    } else {
      return res.status(500).json({ error: 'Refund failed' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
