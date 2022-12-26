const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
dotenv.config();


const app = express();
app.use(express.json());

const options = {
  origin: "http://localhost:3000",
  useSucessStatus: 200,
};
app.use(cors(options));


// Routes
readdirSync("./routes").map((r) => app.use('/', require(`./routes/${r}`)));

// Database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => console.log("Database connected successfully")).catch((err) => console.log("Error connecting to mongodb", err))


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is listening");
});
