// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
// Enable CORS for all routes (important for frontend to talk to backend)
app.use(cors()); 
app.use(bodyParser.json());
// Assuming frontend files (like enhanced_albaik_website.html) are served from a separate path 
// or the user will open them directly. This static path is not strictly needed 
// unless we serve the frontend from this server.
app.use(express.static("public"));   

// in-memory storage for orders. This will reset every time the server restarts.
let orders = [];

// 🧾 Place order
app.post("/api/order", (req, res) => {
  // Capture all fields sent from the client
  const { 
      name, 
      address, 
      cart, // This is expected to be the array of items
      phone, 
      email, 
      totalAmount,
      paymentMethod 
  } = req.body;

  // Validation: Check for required fields and cart array structure
  if (!name || !address || !cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ 
      error: "Missing required order details (Name, Address, Cart/Items). Cart must be a non-empty array." 
    });
  }

  // Mumbai pincode check (server-side validation for an extra layer of safety)
  const match = address.match(/\b4\d{5}\b/);
  if (!match) return res.status(400).json({ error: "Address must contain a Mumbai PIN code (400001–400050)" });
  const pincode = parseInt(match[0]);
  if (pincode < 400001 || pincode > 400050)
    return res.status(400).json({ error: "Outside delivery zone: PIN code not between 400001 and 400050" });

  // Create the final order object with all essential details
  const newOrder = {
    id: Date.now(), // Use timestamp as a unique ID
    name,
    address,
    cart, // Array of item objects
    phone: phone || 'N/A', 
    email: email || 'N/A', 
    totalAmount: totalAmount, 
    paymentMethod: paymentMethod || 'N/A', 
    // Format date for better readability (IST - Mumbai time)
    date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), 
    status: "Pending" // Default status
  };
  
  orders.push(newOrder);
  console.log("✅ New Order Placed:", newOrder);

  // Send back the order ID for customer confirmation
  res.status(200).json({ 
      message: "Order placed successfully!", 
      id: newOrder.id 
  });
});

// 📊 Admin - Get all orders
app.get("/api/orders", (req, res) => {
  // Return the entire list of orders
  res.json(orders);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`\nServer is running on http://localhost:${port}`);
  console.log(`\nFrontend: Open 'enhanced_albaik_website.html' in your browser.`);
  console.log(`Admin Page: http://localhost:${port}/admin.html (assuming you place admin.html in a 'public' folder)`);
});