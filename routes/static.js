const express = require("express")
const router = express.Router()

// Serve static assets from /public (css, js, images)
router.use(express.static("public"))

module.exports = router