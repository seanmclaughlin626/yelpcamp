const review = require("./models/review.js");
const {campgroundSchema, reviewSchema} = require("./schemas.js");
const expressError = require("./utilities/expressError");
const Campground = require("./models/campground");

module.exports.checkLogin = (req, res, next) => {
    if(!req.isAuthenticated()){
        // Store the url they were requesting
        req.session.returnTo = req.originalUrl
        req.flash("error", "Login required");
        res.redirect(307, "/login");
        // The 307 http code spec preserves the send method
    }
    else{
        next();
    }
}

module.exports.verifyAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id); 
    if(!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have the RIGHT");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.revAuthor = async (req, res, next) => {
    const{id, reviewId} = req.params;
    const daReview = await review.findById(reviewId);
    if(!daReview.author.equals(req.user._id)){
        req.flash("error", "Access denied, chump");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); 
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new expressError(msg, 400);
    }
    else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new expressError(msg, 400);
    }
    else{
        next();
    }
}




