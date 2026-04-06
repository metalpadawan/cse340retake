// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Return inventory items by classification as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build add classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// Route to build add inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

// Route to build edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventory)
)

// Process add classification form
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  utilities.handleErrors(invValidate.checkClassificationData),
  utilities.handleErrors(invController.addClassification)
)

// Process add inventory form
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  utilities.handleErrors(invValidate.checkInventoryData),
  utilities.handleErrors(invController.addInventory)
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
