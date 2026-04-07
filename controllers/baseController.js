// Base controller: handles shared public pages that do not belong to another domain.
const utilities = require("../utilities/")
const baseController = {}

// Render the home page and pass the current URL so the nav can highlight Home.
baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav(req.originalUrl)
  res.render("index", {title: "Home", nav})
}

module.exports = baseController
