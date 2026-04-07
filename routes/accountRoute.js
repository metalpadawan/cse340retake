// Account router: authentication, registration, profile updates, and logout.
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Deliver the login page.
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Deliver the default account-management page for the logged-in user.
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Deliver the registration page.
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Deliver the account update page for the logged-in account id.
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
)

// Validate and register a brand-new account.
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Validate credentials, authenticate the account, and issue the JWT cookie.
router.post(
  "/login",
  regValidate.loginRules(),
  utilities.handleErrors(regValidate.checkLoginData),
  utilities.handleErrors(accountController.accountLogin)
)

// Validate and save the non-password account fields.
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  utilities.handleErrors(regValidate.checkAccountUpdateData),
  utilities.handleErrors(accountController.updateAccount)
)

// Validate and save a replacement password hash.
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  utilities.handleErrors(regValidate.checkPasswordUpdateData),
  utilities.handleErrors(accountController.updatePassword)
)

// Clear the auth cookie and end the session from the browser's perspective.
router.get(
  "/logout",
  utilities.checkLogin,
  utilities.handleErrors(accountController.accountLogout)
)

// Export the router for use in server.js
module.exports = router
