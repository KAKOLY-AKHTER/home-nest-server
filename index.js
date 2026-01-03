const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("./serviceKey.json");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  // origin:["http://localhost:5173"]
}));

app.use(express.json());

// Firebase Admin SDK init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.62nbtq9.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// Middleware: Verify Firebase Token


const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await usersCollection.findOne({ email: decoded.email });

    if (user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Admin only" });
    }
    next();
  } catch {
    res.status(401).send({ message: "Unauthorized" });
  }
};



const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Unauthorized access. Token not found!" });
  }

  const token = authorization.split(" ")[1];
  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized access. Invalid token." });
  }
};

async function run() {
  try {
    await client.connect();
    console.log(" MongoDB connected successfully!");

    const db = client.db("home-db");
    const homeCollection = db.collection("homes");
    const ratingCollection = db.collection("ratings");
const usersCollection = db.collection("users");

    //  Get all homes
    app.get("/homes", async (req, res) => {
      const result = await homeCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    //  Get single home
    app.get("/homes/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await homeCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).send({ success: false, message: "Property not found" });
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error" });
      }
    });




    //  Add new home
    app.post("/homes", verifyToken, async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
      const result = await homeCollection.insertOne(data);
      res.send({ success: true, result });
    });


    app.get("/my-ratings", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const query = { reviewerEmail: email };
        const ratings = await ratingCollection.find(query).toArray();

        res.status(200).json(ratings);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });



    app.post("/add-rating",verifyToken, async (req, res) => {
      try {
        const ratingData = req.body;
        ratingData.createdAt = new Date();

        const result = await ratingCollection.insertOne(ratingData);
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error adding rating:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
      }
    });



    app.get("/property-ratings/:id", async (req, res) => {
      try {
        const propertyId = req.params.id;
        const query = { propertyId: propertyId };
        const ratings = await ratingCollection.find(query).toArray();
        res.status(200).json(ratings);
      } catch (error) {
        console.error("Error fetching property ratings:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });




    app.get("/my-properties", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const query = { userEmail: email };
        const properties = await homeCollection.find(query).toArray();

        res.status(200).json(properties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //  Update home
    app.put("/homes/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const result = await homeCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send({ success: true, result });
    });

    //  Delete home
    app.delete("/homes/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await homeCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    //  Get latest 6 homes 


    app.get("/latest-homes", async (req, res) => {
      const result = await homeCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });



    //  Search homes


    app.get("/search", async (req, res) => {
      const search = req.query.search || "";
      const result = await homeCollection
        .find({
          $or: [
            { propertyName: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });



    app.get("/sorted-properties", async (req, res) => {
      const sortField = req.query.sort || "createdAt";
      const sortOrder = req.query.order === "asc" ? 1 : -1;

      const result = await homeCollection.find().sort({ [sortField]: sortOrder }).toArray();
      res.send(result);
    });


    app.put("/homes/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await homeCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    );
    res.send({ success: true, result });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

// Save property to favorites
app.post("/save-property", verifyToken, async (req, res) => {
  try {
    const saveData = req.body;
    saveData.savedAt = new Date();
    
    const favoritesCollection = db.collection("favorites");
    // Check if already saved
    const existing = await favoritesCollection.findOne({
      userId: saveData.userId,
      propertyId: saveData.propertyId
    });
    
    if (existing) {
      return res.send({ success: false, message: "Already saved" });
    }
    
    const result = await favoritesCollection.insertOne(saveData);
    res.send({ success: true, result });
  } catch (error) {
    console.error("Error saving property:", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});

// Add viewCount field to existing documents
app.put("/add-view-count", async (req, res) => {
  try {
    const result = await homeCollection.updateMany(
      { viewCount: { $exists: false } },
      { $set: { viewCount: Math.floor(Math.random() * 100) + 50 } }
    );
    res.send({ success: true, result });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});





app.get("/properties", async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      location = "",
      sort = "createdAt-desc",
      page = 1,
      limit = 8,
    } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { propertyName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Location filter
    if (location) {
      query.location = location;
    }

    // Sort
    const [sortField, sortOrder] = sort.split("-");
    const order = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const cursor = homeCollection
      .find(query)
      .sort({ [sortField]: order })
      .skip(skip)
      .limit(parseInt(limit));

    const items = await cursor.toArray();
    const totalItems = await homeCollection.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.send({
      success: true,
      items,
      totalItems,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});


    // Default route

    app.get("/", (req, res) => {
      res.send("Real Estate Server is running perfectly!");
    });



    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
}
run();


