const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const initData = require("./data.js");

async function main() {
    await mongoose.connect(process.env.DB_URL);
}

main().then(() => console.log("DB connected"));

const seedDB = async () => {

    const user = await User.findOne(); // 🔥 IMPORTANT

    if (!user) {
        console.log("No user found, create user first!");
        return;
    }

    initData.data = initData.data.map(obj => ({
        ...obj,
        owner: user._id
    }));

    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);

    console.log("Seed done");
};

seedDB();