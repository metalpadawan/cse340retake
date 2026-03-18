// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
// Example result: /inv/type/3
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;
