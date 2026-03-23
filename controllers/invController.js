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

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  // Read the inventory id from the route parameter.
  const inv_id = req.params.invId
  // Retrieve the single vehicle record from the model.
  const vehicle = await invModel.getInventoryById(inv_id)
  // If no vehicle is found, pass a 404 error to the error handler.
  if (!vehicle) return next({ status: 404, message: "Sorry, we appear to have lost that page." })
  // Wrap the vehicle data in HTML using the utility function.
  const vehicleHtml = await utilities.buildVehicleDetail(vehicle)
  res.render("inventory/detail", {
    title: vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model,
    vehicleHtml,
  })
}

/* ***************************
 *  Intentional Error Trigger (Task 3)
 *  Throws a 500-type error to test the error handler middleware.
 * ************************** */
invCont.triggerError = async function (req, res, next) {
  // Deliberately throw an error to verify the error handling middleware works.
  throw new Error("Intentional 500 error triggered!")
}

module.exports = invCont