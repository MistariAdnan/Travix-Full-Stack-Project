const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // ✅ Add this line
main().then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

//databse k liye
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    initData.data = initData.data.map((obj) => ({...obj,
        owner: "688b840fd89eeb50cdf2b944"
    }));
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was intialized");
}
initDB();

app.use(methodOveride("_method"));