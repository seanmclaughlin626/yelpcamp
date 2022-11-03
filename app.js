// Enable dotenv while in development mode
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

// console.log(process.env.API_KEY)
// ^Proof of concept. Requiring dotenv puts the contents of .env in process.env

// First, the basic prerequisites
// The packages:
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrat = require("passport-local")
const expressError = require("./utilities/expressError");
const User = require("./models/user");
const { register } = require("./models/user");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require ("helmet");
const MongoStore = require("connect-mongo");

// Connecting to mongoose (prod mode)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp';

mongoose.connect(dbUrl);


// Connecting to mongoose (dev mode):
// mongoose.connect('mongodb://localhost:27017/YelpCamp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

// Secondary setup for packages and simplifying views access:
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// We're gonna need to parse the request body, use extra methods, serve 
// static assets, sanitize mongo queries (protection from mongo injections):
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: "_"
}));

// Session configuration, flash setup, passport configuration
const secret = process.env.SECRET || "control";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600
    // ^Time (in SECONDS) between database updates without changes being 
    // made
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    name: "makima",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // ^This is the default nowadays but still important for security
        // secure: true,
        // ^uncomment this when deployed
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // ^This is because date.now is in fucking MILLISECONDS??
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet() );

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drnz4y08h/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
// ^Required for persistant login sessions. Session MUST be configured
// before passport.session
passport.use(new LocalStrat(User.authenticate()));
// ^Use local strategy to invoke the autheniticate method from user model
// In this case authenticate is a method that comes with passport
passport.serializeUser(User.serializeUser());
// ^Serialization is storing a user in a session
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

// The Route Handlers
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/fakeUser", async(req, res) => {
    const user = new User({email: "beepo@gmail.com", username: "bbbbb"});
    const faker = await User.register(user, "chicken");
    // ^Second arg is a password, auto hashed and stored
    res.send(faker)
})
// ^this route is just a demo of how new users are made using passport



// Error handling
app.all("*", (req, res, next) => {
    next(new expressError("Page Not Found", 404));
})
// ^Since it's at the end it only runs if no other path does

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message="Oh no, something went wrong!"
    res.status(statusCode).render("error", {err});
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})