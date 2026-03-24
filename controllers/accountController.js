// Needed Resources
const utilities = require("../utilities")

const accountCont = {}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  // Build the navigation bar to pass to the login view.
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

module.exports = { buildLogin }