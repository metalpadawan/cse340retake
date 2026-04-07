// Account validation middleware: sanitizes, validates, and redisplays sticky form values.
const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")

const validate = {}

// Shared renderer so account update validation errors can return the same view consistently.
async function renderAccountUpdateView(res, req, data = {}, errors = null) {
  const nav = await utilities.getNav()
  const {
    account_id = "",
    account_firstname = "",
    account_lastname = "",
    account_email = "",
  } = data

  return res.render("account/update", {
    title: "Update Account",
    nav,
    errors,
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  })
}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // Trim and escape the names before checking that something meaningful remains.
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .bail()
      .isLength({ min: 1 }),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("A valid email is required.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .bail()
      .normalizeEmail()
      // Registration must block duplicate emails because email is used as the login identity.
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)

        if (typeof emailExists === "string") {
          throw new Error("Sorry, there was an error checking the email.")
        }

        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password does not meet requirements.")
      .bail()
      // Mirror the password strength rules used in the client-side pattern validation.
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

// Keep compatibility with the spelling used in the course example.
validate.registationRules = validate.registrationRules

/* ******************************
 * Check registration data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Re-render the form with sticky values for every field except the password.
    const nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }

  next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // Login still validates email format even though the account may or may not exist yet.
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("A valid email is required.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .bail()
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password does not meet requirements.")
      .bail()
      // The login form uses the same strength requirements as registration in this project.
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Only keep the email sticky on login; never echo a password back to the page.
    const nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }

  next()
}

/*  **********************************
 *  Account update data validation rules
 * ********************************* */
validate.accountUpdateRules = () => {
  return [
    // The hidden account id lets the server verify ownership of the submitted update.
    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account information could not be processed.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Account information could not be processed.")
      .toInt(),

    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .bail()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .bail()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("A valid email is required.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .bail()
      .normalizeEmail()
      // Allow the current user to keep their own email, but block taking another user's email.
      .custom(async (account_email, { req }) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email,
          parseInt(req.body.account_id, 10)
        )

        if (typeof emailExists === "string") {
          throw new Error("Sorry, there was an error checking the email.")
        }

        if (emailExists) {
          throw new Error("That email address already exists. Please use a different email.")
        }
      }),
  ]
}

/* ******************************
 * Check account update data and return errors or continue
 * ***************************** */
validate.checkAccountUpdateData = async (req, res, next) => {
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body

  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Return the posted values so the update form stays sticky after validation failures.
    return renderAccountUpdateView(
      res,
      req,
      {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
      errors
    )
  }

  next()
}

/*  **********************************
 *  Password update validation rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    // The password-change form includes its own hidden account id for authorization checks.
    body("account_id")
      .trim()
      .notEmpty()
      .withMessage("Account information could not be processed.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Account information could not be processed.")
      .toInt(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password does not meet requirements.")
      .bail()
      // Enforce the same strong-password rules used across registration and login.
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check password update data and return errors or continue
 * ***************************** */
validate.checkPasswordUpdateData = async (req, res, next) => {
  const account_id = parseInt(req.body.account_id, 10)
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Reload the existing account info so the non-password form remains populated.
    const accountData = await accountModel.getAccountById(account_id)

    return renderAccountUpdateView(
      res,
      req,
      {
        account_id,
        account_firstname: accountData ? accountData.account_firstname : "",
        account_lastname: accountData ? accountData.account_lastname : "",
        account_email: accountData ? accountData.account_email : "",
      },
      errors
    )
  }

  next()
}

module.exports = validate
