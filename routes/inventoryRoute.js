// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
// Example result: /inv/type/3
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view
// Example result: /inv/detail/15
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// Route to trigger an intentional 500 error (Task 3)
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router