// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Route to build the login view
// Example result: /account/login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build the registration view
// Example result: /account/register
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Export the router for use in server.js
module.exports = router
