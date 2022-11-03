// Requirements
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require("../cloudinary");

// Controls
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
    // Grabs campgrounds as a variable, then renders it
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location ,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash("success", "Successfully made new campground!");
    res.redirect(`/campgrounds/${newCamp.id}`);
    }

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("author");
    if(!campground){
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", {campground});
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
    } 
    res.render("campgrounds/edit", {campground});
}

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "Campground not found");
        res.redirect("/campgrounds");
    }
    const updatedCamp = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    updatedCamp.images.push(...imgs);
    await updatedCamp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCamp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }  
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${updatedCamp.id}`);
}

module.exports.destroyCampground = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted!");
    res.redirect("/campgrounds");
}
// NOTE: calling it destroy instead of delete is best practice