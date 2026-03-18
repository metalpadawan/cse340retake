const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const className = data.length > 0 ? data[0].classification_name : "Vehicles"
  res.render("inventory/classification", {
    title: className + " vehicles",
    grid,
  })
}

module.exports = invCont
