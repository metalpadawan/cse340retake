// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Route to build the login view
// Example result: /account/login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Route to build the registration view
// Example result: /account/register
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to build account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
)

// Route to process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  utilities.handleErrors(regValidate.checkLoginData),
  utilities.handleErrors(accountController.accountLogin)
)

// Process account update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  utilities.handleErrors(regValidate.checkAccountUpdateData),
  utilities.handleErrors(accountController.updateAccount)
)

// Process password update
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  utilities.handleErrors(regValidate.checkPasswordUpdateData),
  utilities.handleErrors(accountController.updatePassword)
)

// Process logout
router.get(
  "/logout",
  utilities.checkLogin,
  utilities.handleErrors(accountController.accountLogout)
)

// Export the router for use in server.js
module.exports = router
