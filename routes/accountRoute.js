// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

// Route to build the login view
// Example result: /account/login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

module.exports = router