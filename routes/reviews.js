// Requirements
const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utilities/wrapAsync");
const {checkLogin, revAuthor, validateReview} = require("../middleware");
const reviews = require('../controllers/reviews');

// Routes//
router.post("/", checkLogin, validateReview, wrapAsync(reviews.createReview))

router.delete("/:reviewId", checkLogin, revAuthor, wrapAsync(reviews.destroyReview))

module.exports = router;