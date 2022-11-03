const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers");
const Campground = require("../models/campground");
// ^THE . MEANS BACK UP ONE LAYER OF FOLDERS

mongoose.connect('mongodb://localhost:27017/YelpCamp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const clearDB = async() => {
    await Campground.deleteMany({});
    mongoose.connection.close();
}

clearDB();

