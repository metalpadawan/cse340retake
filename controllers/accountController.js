// Needed Resources
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const TOKEN_MAX_AGE = 60 * 60 * 1000

function buildAccountTokenPayload(accountData) {
  return {
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
  }
}

function setJwtCookie(res, accountData) {
  const accessToken = jwt.sign(
    buildAccountTokenPayload(accountData),
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: 3600 }
  )

  const cookieOptions = {
    httpOnly: true,
    maxAge: TOKEN_MAX_AGE,
  }

  if (process.env.NODE_ENV !== "development") {
    cookieOptions.secure = true
  }

  res.cookie("jwt", accessToken, cookieOptions)
}

async function renderUpdateView(req, res, accountData, errors = null) {
  const nav = await utilities.getNav()

  return res.render("account/update", {
    title: "Update Account",
    nav,
    errors,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  // Build the navigation bar to pass to the login view.
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(res.locals.accountData.account_id, 10)
  const freshAccountData = await accountModel.getAccountById(account_id)
  const accountData =
    freshAccountData && !(freshAccountData instanceof Error)
      ? freshAccountData
      : res.locals.accountData

  res.locals.accountData = accountData
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  // Build the navigation bar to pass to the registration view.
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccountView(req, res, next) {
  const account_id = parseInt(req.params.account_id, 10)
  const loggedInAccountId = parseInt(res.locals.accountData.account_id, 10)

  if (Number.isNaN(account_id) || account_id !== loggedInAccountId) {
    req.flash("notice", "You may only update your own account information.")
    return res.redirect("/account/")
  }

  const accountData = await accountModel.getAccountById(account_id)

  if (!accountData || accountData instanceof Error) {
    return next({ status: 404, message: "Sorry, we appear to have lost that page." })
  }

  return renderUpdateView(req, res, accountData)
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  // Destructure the form data from the request body using the data trail field names.
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  // Send the data to the model to be inserted into the database.
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // If successful, flash a congratulations message and redirect to login.
  if (regResult && regResult.rowCount) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "",
    })
  }

  // If the insertion failed, flash an error and return to the registration view.
  req.flash("notice", "Sorry, the registration failed.")
  return res.status(501).render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData || accountData instanceof Error || typeof accountData === "string") {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!passwordMatch) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }

    delete accountData.account_password

    setJwtCookie(res, accountData)
    req.flash("notice", `Welcome back, ${accountData.account_firstname}.`)
    return res.redirect("/account/")
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing your login.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res) {
  const loggedInAccountId = parseInt(res.locals.accountData.account_id, 10)
  const account_id = parseInt(req.body.account_id, 10)
  const {
    account_firstname,
    account_lastname,
    account_email,
  } = req.body

  if (Number.isNaN(account_id) || account_id !== loggedInAccountId) {
    req.flash("notice", "You may only update your own account information.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult && !(updateResult instanceof Error) && typeof updateResult !== "string") {
    const refreshedAccountData = await accountModel.getAccountById(account_id)

    if (refreshedAccountData && !(refreshedAccountData instanceof Error)) {
      setJwtCookie(res, refreshedAccountData)
    }

    req.flash("notice", "Your account information was successfully updated.")
    return res.redirect("/account/")
  }

  req.flash("notice", "Sorry, your account information could not be updated.")
  return res.redirect("/account/")
}

/* ****************************************
 *  Process password update
 * ************************************ */
async function updatePassword(req, res) {
  const loggedInAccountId = parseInt(res.locals.accountData.account_id, 10)
  const account_id = parseInt(req.body.account_id, 10)
  const { account_password } = req.body

  if (Number.isNaN(account_id) || account_id !== loggedInAccountId) {
    req.flash("notice", "You may only update your own account information.")
    return res.redirect("/account/")
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating your password.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  )

  if (updateResult && !(updateResult instanceof Error) && typeof updateResult !== "string") {
    req.flash("notice", "Your password was successfully updated.")
    return res.redirect("/account/")
  }

  req.flash("notice", "Sorry, your password could not be updated.")
  return res.redirect("/account/")
}

/* ****************************************
 *  Process logout
 * ************************************ */
async function accountLogout(req, res) {
  const cookieOptions = {
    httpOnly: true,
  }

  if (process.env.NODE_ENV !== "development") {
    cookieOptions.secure = true
  }

  res.clearCookie("jwt", cookieOptions)
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  buildAccountManagement,
  buildRegister,
  buildUpdateAccountView,
  registerAccount,
  accountLogin,
  updateAccount,
  updatePassword,
  accountLogout,
}
