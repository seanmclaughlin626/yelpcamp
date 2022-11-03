// Requirements
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilities/wrapAsync");
const {checkLogin, verifyAuthor, validateCampground} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage}); 

// Routes
router.route("/")
.get(wrapAsync(campgrounds.index))
.post(checkLogin,  upload.array("image"), validateCampground, wrapAsync(campgrounds.createCampground))
// NOTE: NO SEMICOLONS ON THE SECOND DEGREE ROUTES
// You can even use .all to add route-specific middleware to all routes

router.get("/new", checkLogin, campgrounds.renderNewForm);

router.route("/:id")
.get(wrapAsync(campgrounds.showCampground))
.put(checkLogin, verifyAuthor, upload.array("image"), validateCampground, wrapAsync(campgrounds.updateCampground))
.delete(checkLogin, verifyAuthor, wrapAsync(campgrounds.destroyCampground))

router.get("/:id/edit", checkLogin, verifyAuthor, wrapAsync(campgrounds.renderEditForm))

// NOTE: REMEMBER THE MOTHERFUCKING ROUTE ORDER. NEW BEFORE ID. DEFINITIVE BEFORE OPEN-ENDED. FUCK YOU SEAN.

// Export
module.exports = router;