/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const utilities = require("./utilities/")

/* ***********************
 * Routes
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") //not at views root

app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
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
app.get("/", baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
