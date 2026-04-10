// Inventory router: public browsing plus protected admin inventory management.
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
// Wrap the account-type guard so async failures go to the shared error handler.
const checkEmployeeOrAdmin = utilities.handleErrors(utilities.checkAccountType)

// Protected inventory management landing page.
router.get(
  "/",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

// Protected AJAX endpoint that returns inventory rows for the management table.
router.get(
  "/getInventory/:classification_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Deliver the add-classification form.
router.get(
  "/add-classification",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

// Deliver the add-inventory form.
router.get(
  "/add-inventory",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

// Deliver the edit form for a specific inventory item.
router.get(
  "/edit/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventory)
)

// Deliver the delete-confirmation page for a specific inventory item.
router.get(
  "/delete/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Validate and insert a new classification.
router.post(
  "/add-classification",
  checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  utilities.handleErrors(invValidate.checkClassificationData),
  utilities.handleErrors(invController.addClassification)
)

// Validate and insert a new vehicle row.
router.post(
  "/add-inventory",
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  utilities.handleErrors(invValidate.checkInventoryData),
  utilities.handleErrors(invController.addInventory)
)

// Validate and update an existing vehicle row.
router.post(
  "/update",
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  utilities.handleErrors(invValidate.checkUpdateData),
  utilities.handleErrors(invController.updateInventory)
)

// Delete the selected inventory row after confirmation.
router.post(
  "/delete",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

// Public search page for finding inventory by term and classification.
router.get(
  "/search",
  utilities.handleErrors(invController.buildSearchView)
)

// Process inventory search requests and render matching results.
router.post(
  "/search",
  invValidate.searchRules(),
  utilities.handleErrors(invValidate.checkSearchData),
  utilities.handleErrors(invController.searchInventory)
)

// Public classification browsing route.
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Public vehicle detail route.
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// Development/testing route for exercising the error handler.
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router
