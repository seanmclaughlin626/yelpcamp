if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers");
const Campground = require("../models/campground");
// ^THE . MEANS BACK UP ONE LAYER OF FOLDERS
const mapBoxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

mongoose.connect('mongodb://localhost:27017/YelpCamp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

// Means of seeding yelpcamp:
const sample = array => array[Math.floor(Math.random() * array.length)]
// ^Lets you automatically pick a random position out of an array,
// see use in seedDB title section

const seedDB = async() => {
    await Campground.deleteMany({});
    // THIS IS HOW YOU CLEAR A DB ^^^
    for(let i = 0; i < 400; i++){
        const random1000 =  Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const location = `${cities[random1000].city}, ${cities[random1000].state}`
        // const geoData = await geocoder.forwardGeocode({
        //     query: location ,
        //      limit: 1
        // }).send()
        const camp = new Campground ({
            author: "632ba2e1e125cde895a5ef54",
            location: location,
            // geometry: geoData.body.features[0].geometry,
            geometry: {
                type: "Point",
                coordinates: [`${cities[random1000].longitude}`,`${cities[random1000].latitude}`]
            },
                title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/drnz4y08h/image/upload/v1664857014/YelpCamp/mpqvwoumyyfytp9mwexq.jpg',
                    filename: 'YelpCamp/vxj8sl3caeexhycv4t3n'
                  },
                  {
                    url: 'https://res.cloudinary.com/drnz4y08h/image/upload/v1664857014/YelpCamp/svngabk7494yqkfjheqj.jpg',
                    filename: 'YelpCamp/rhvzozjtqzzhnerfbuly'
                  }
                
            ],
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fugiat tempora libero, harum nulla impedit beatae, quia incidunt alias praesentium in quisquam ex explicabo ratione distinctio, quaerat autem odio! Iure, nisi.",
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
// ^Since seedDB is an async function, we can .then it
// NOTE THAT RUNNING THIS DOES DELETE YOUR WHOLE DATABASE, SO BE CAREFUL
