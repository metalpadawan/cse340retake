// Inventory controller: renders public inventory pages and protected admin workflows.
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res) {
  // Reuse the same classification selector used by add/edit inventory forms.
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    classificationSelect,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  // Start with an empty classification field for a clean form load.
  res.render("inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    classification_name: "",
  })
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  // Preload the select list and default image placeholders for a new vehicle.
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
  })
}

/* ***************************
 *  Build inventory search view
 * ************************** */
invCont.buildSearchView = async function (req, res) {
  // Start with an empty search form and an optional classification filter.
  const classificationList = await utilities.buildClassificationList(
    null,
    true,
    false
  )

  res.render("inventory/search", {
    title: "Search Inventory",
    errors: null,
    classificationList,
    search_term: "",
    classification_id: "",
    results: null,
    hasSearched: false,
  })
}

/* ***************************
 *  Process inventory search
 * ************************** */
invCont.searchInventory = async function (req, res) {
  const { search_term, classification_id } = req.body
  const selectedClassificationId =
    classification_id === null || classification_id === undefined || classification_id === ""
      ? null
      : Number.isNaN(Number(classification_id))
        ? null
        : parseInt(classification_id, 10)

  // Rebuild the select list with the submitted filter preserved.
  const classificationList = await utilities.buildClassificationList(
    selectedClassificationId,
    true,
    false
  )

  const results = await invModel.searchInventory(
    search_term,
    selectedClassificationId
  )

  res.render("inventory/search", {
    title: "Search Inventory",
    errors: null,
    classificationList,
    search_term,
    classification_id: selectedClassificationId || "",
    results,
    hasSearched: true,
  })
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)

  // Reject malformed ids before querying the database.
  if (Number.isNaN(inv_id)) {
    return next({ status: 404, message: "Sorry, we appear to have lost that page." })
  }

  // Load the existing inventory row so the edit form can be prefilled.
  const itemData = await invModel.getInventoryById(inv_id)

  if (!itemData) {
    return next({ status: 404, message: "Sorry, we appear to have lost that page." })
  }

  // Build the select list with the current classification preselected.
  const classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  )
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    errors: null,
    classificationList,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update inventory data
 * ************************** */
invCont.updateInventory = async function (req, res) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  // Send the edited field values to the model for persistence.
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  }

  // If the update fails, rebuild the edit form with the submitted values intact.
  const classificationList = await utilities.buildClassificationList(
    classification_id
  )
  const itemName = `${inv_make} ${inv_model}`
  req.flash("notice", "Sorry, the update failed.")
  return res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    errors: null,
    classificationList,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  })
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirm = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)

  // Reject malformed ids before attempting the lookup.
  if (Number.isNaN(inv_id)) {
    return next({ status: 404, message: "Sorry, we appear to have lost that page." })
  }

  // Fetch the existing row so the user can confirm they are deleting the right item.
  const itemData = await invModel.getInventoryById(inv_id)

  if (!itemData) {
    return next({ status: 404, message: "Sorry, we appear to have lost that page." })
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  return res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res) {
  const inv_id = parseInt(req.body.inv_id, 10)
  const { inv_make, inv_model } = req.body
  const itemName = `${inv_make} ${inv_model}`

  // The model returns the database rowCount so the controller can decide success or failure.
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult && deleteResult.rowCount) {
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    return res.redirect("/inv/")
  }

  req.flash("notice", "Sorry, the delete failed.")
  return res.redirect(`/inv/delete/${inv_id}`)
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  // Read the selected classification id from the route parameter.
  const classification_id = parseInt(req.params.classificationId, 10)
  // Pull all inventory items that belong to that classification.
  const data = await invModel.getInventoryByClassificationId(classification_id)
  // Turn the returned records into HTML the view can display.
  const grid = await utilities.buildClassificationGrid(data)
  // Use the classification name from the first row, or a fallback if no rows exist.
  const className = data.length > 0 ? data[0].classification_name : "Vehicles"
  const nav = await utilities.getNav(req.originalUrl, classification_id)
  res.render("inventory/classification", {
    title: className + " vehicles",
    grid,
    nav,
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
  const nav = await utilities.getNav(req.originalUrl, vehicle.classification_id)
  res.render("inventory/detail", {
    title: vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model,
    vehicleHtml,
    nav,
  })
}

/* ***************************
 *  Add new classification
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  // Insert the new classification so it becomes available in nav and select lists.
  const regResult = await invModel.insertClassification(classification_name)

  if (regResult && regResult.rowCount) {
    // Rebuild nav/select values immediately so the new classification appears without a refresh.
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("notice", `The ${classification_name} classification was added successfully.`)
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
    })
  }

  req.flash("notice", "Sorry, the new classification could not be added.")
  return res.status(501).render("inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    classification_name,
  })
}

/* ***************************
 *  Add new inventory item
 * ************************** */
invCont.addInventory = async function (req, res) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  // Insert the new vehicle using the exact field order expected by the model query.
  const regResult = await invModel.insertInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (regResult && regResult.rowCount) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("notice", `${inv_make} ${inv_model} was added successfully.`)
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
    })
  }

  // If the insert fails, repopulate the form so the user does not lose their work.
  const classificationList = await utilities.buildClassificationList(
    classification_id
  )
  req.flash("notice", "Sorry, the new inventory item could not be added.")
  return res.status(501).render("inventory/add-inventory", {
    title: "Add Inventory",
    errors: null,
    classificationList,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
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

/* ***************************
 *  Return inventory by classification as JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id, 10)

  // Return an empty array for invalid input so the AJAX caller can fail gracefully.
  if (Number.isNaN(classification_id)) {
    return res.json([])
  }

  // Return plain JSON for the management page JavaScript to transform into a table.
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData && invData.length > 0 && invData[0].inv_id) {
    return res.json(invData)
  }

  return res.json([])
}

module.exports = invCont
