const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  // Read the selected classification id from the route parameter.
  const classification_id = req.params.classificationId
  // Pull all inventory items that belong to that classification.
  const data = await invModel.getInventoryByClassificationId(classification_id)
  // Turn the returned records into HTML the view can display.
  const grid = await utilities.buildClassificationGrid(data)
  // Use the classification name from the first row, or a fallback if no rows exist.
  const className = data.length > 0 ? data[0].classification_name : "Vehicles"
  res.render("inventory/classification", {
    title: className + " vehicles",
    grid,
  })
}

module.exports = invCont
