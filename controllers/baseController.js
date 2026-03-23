const utilities = require("../utilities/")
const baseController = {}

// Build the home page and send the shared navigation to the view.
baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  req.flash("notice", "This is a flash message.")
  res.render("index", {title: "Home", nav})
}

module.exports = baseController
