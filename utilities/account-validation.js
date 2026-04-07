const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")

const validate = {}

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
