// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
const checkEmployeeOrAdmin = utilities.handleErrors(utilities.checkAccountType)

// Inventory management view
router.get(
  "/",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

// Return inventory items by classification as JSON
router.get(
  "/getInventory/:classification_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build add classification view
router.get(
  "/add-classification",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

// Route to build add inventory view
router.get(
  "/add-inventory",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

// Route to build edit inventory view
router.get(
  "/edit/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventory)
)

// Route to build delete confirmation view
router.get(
  "/delete/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Process add classification form
router.post(
  "/add-classification",
  checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  utilities.handleErrors(invValidate.checkClassificationData),
  utilities.handleErrors(invController.addClassification)
)

// Process add inventory form
router.post(
  "/add-inventory",
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  utilities.handleErrors(invValidate.checkInventoryData),
  utilities.handleErrors(invController.addInventory)
)

// Process inventory update
router.post(
  "/update",
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  utilities.handleErrors(invValidate.checkUpdateData),
  utilities.handleErrors(invController.updateInventory)
)

// Process inventory delete
router.post(
  "/delete",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

// Route to build inventory by classification view
// Example result: /inv/type/3
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view
// Example result: /inv/detail/15
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// Route to trigger an intentional 500 error (Task 3)
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router
