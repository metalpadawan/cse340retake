/* ******************************************
 * Application bootstrap
 * This file wires the Express app together:
 * - loads dependencies and environment values
 * - applies shared middleware in the required order
 * - mounts the public, account, and inventory routes
 * - handles missing routes and unexpected errors
 * - starts the HTTP server
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const accountRoute = require("./routes/accountRoute")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()
const static = require("./routes/static")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require("./database/")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * The order here matters. Sessions and cookies
 * must be available before auth checks, and the
 * auth check must happen before protected routes.
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Parse JSON bodies sent by fetch/AJAX requests.
app.use(bodyParser.json())
// Parse HTML form submissions.
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// Read cookies so the JWT middleware can inspect them.
app.use(cookieParser())
// If a JWT exists, validate it and expose account data to the request cycle.
app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  // Make flash messages available to every rendered view.
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Routes
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") //not at views root
app.use("/account", accountRoute)

// Build the navigation once per request so layouts and views can reuse it.
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav(req.originalUrl)
    next()
  } catch (error) {
    next(error)
  }
})
/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute)
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  // Send unknown URLs into the shared error handler as a 404.
  next({status: 404, message: "Sorry, we appear to have lost that page."})
})
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"
/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav(req.originalUrl)
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  // Show the custom 404 message when present, otherwise fall back to a generic crash message.
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})
/* ***********************
 * Log statement to confirm server operation
 *************************/
// Start the Express server using environment values when available.
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
