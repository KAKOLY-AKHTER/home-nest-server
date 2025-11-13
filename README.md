# 🏠 HomeNest Server

This is the backend server for **HomeNest**, a real estate listing platform where users can post, browse, rate, and manage property listings.

---

## 🌐 Live Client Site

👉 [https://brilliant-dango-ec0742.netlify.app](https://brilliant-dango-ec0742.netlify.app)

---

## 🚀 Features

- 🔐 Firebase Admin SDK for secure token verification  
- 🏡 CRUD operations for property listings  
- ⭐ Ratings and Reviews system  
- 🔍 Search and Sort functionality  
- 📦 MongoDB integration  
- ⚙️ Protected routes for sensitive operations  

---

## 🧪 Technologies Used

- Express.js  
- MongoDB (native driver)  
- Firebase Admin SDK  
- dotenv  
- CORS  

---

## 📁 API Endpoints

### 🏡 Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/homes` | Get all properties |
| `GET` | `/homes/:id` | Get single property (protected) |
| `POST` | `/homes` | Add new property (protected) |
| `PUT` | `/homes/:id` | Update property (protected) |
| `DELETE` | `/homes/:id` | Delete property (protected) |
| `GET` | `/my-properties?email=` | Get properties by user email |
| `GET` | `/latest-homes` | Get 6 latest properties |
| `GET` | `/search?search=` | Search by property name or location |
| `GET` | `/sorted-properties?sort=&order=` | Sort properties by price or date |

### ⭐ Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/add-rating` | Add a rating |
| `GET` | `/my-ratings?email=` | Get ratings by user |
| `GET` | `/property-ratings/:id` | Get ratings for a property |

---

## 🔧 Setup Instructions

1. Clone the repository  
2. Run `npm install`  
3. Create a `.env` file using the structure from `.env.example`  
4. Add your Firebase Admin SDK `serviceKey.json` file in the root directory  
5. Run the server:

```bash
node index.js

