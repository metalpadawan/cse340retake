// Inventory validation middleware: protects add/edit forms and returns sticky values on errors.
const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")

const validate = {}

/* ******************************
 * Inventory search validation rules
 * ***************************** */
validate.searchRules = () => {
  return [
    // Require a short but meaningful search term so the search stays useful.
    body("search_term")
      .trim()
      .notEmpty()
      .withMessage("Please enter a search term.")
      .bail()
      .isLength({ min: 2, max: 50 })
      .withMessage("Search terms must be between 2 and 50 characters."),

    // Allow the classification filter to be blank so users can search all inventory.
    body("classification_id")
      .optional({ checkFalsy: true })
      .isInt({ min: 1 })
      .withMessage("Please choose a valid classification.")
      .toInt(),
  ]
}

/* ******************************
 * Check search data and return errors or continue
 * ***************************** */
validate.checkSearchData = async (req, res, next) => {
  const { search_term, classification_id } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const selectedClassificationId =
      classification_id === null || classification_id === undefined || classification_id === ""
        ? null
        : Number.isNaN(Number(classification_id))
          ? null
          : parseInt(classification_id, 10)

    const classificationList = await utilities.buildClassificationList(
      selectedClassificationId,
      true,
      false
    )

    return res.render("inventory/search", {
      title: "Search Inventory",
      errors,
      classificationList,
      search_term,
      classification_id: selectedClassificationId || "",
      results: null,
      hasSearched: false,
    })
  }

  next()
}

/* ******************************
 * Classification data validation rules
 * ***************************** */
validate.classificationRules = () => {
  return [
    // Classification names are limited to letters and numbers so the nav stays predictable.
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .bail()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters.")
      .bail()
      // Prevent duplicate classification rows before insert is attempted.
      .custom(async (classification_name) => {
        const classificationExists =
          await invModel.checkExistingClassification(classification_name)

        if (typeof classificationExists === "string") {
          throw new Error("Sorry, there was an error checking the classification.")
        }

        if (classificationExists) {
          throw new Error("That classification already exists.")
        }
      }),
  ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Return the attempted classification name so the user can correct it quickly.
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      errors,
      classification_name,
    })
  }

  next()
}

/* ******************************
 * Inventory data validation rules
 * ***************************** */
validate.inventoryRules = () => {
  return [
    // These rules mirror the database field types and the client-side HTML requirements.
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle model."),

    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide a 4-digit model year.")
      .bail()
      .matches(/^\d{4}$/)
      .withMessage("Please provide a 4-digit model year."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle description.")
      .bail()
      .isLength({ min: 10 })
      .withMessage("Please provide a vehicle description with at least 10 characters."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an inventory image path.")
      .bail()
      // Require images to be stored under the public vehicle image folder.
      .matches(/^\/images\/vehicles\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i)
      .withMessage("Please provide a valid inventory image path."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide an inventory thumbnail path.")
      .bail()
      .matches(/^\/images\/vehicles\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i)
      .withMessage("Please provide a valid inventory thumbnail path."),

    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a valid price.")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price.")
      .toFloat(),

    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide valid mileage.")
      .bail()
      .isInt({ min: 0 })
      .withMessage("Please provide valid mileage.")
      .toInt(),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a vehicle color."),

    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please choose a classification.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Please choose a classification.")
      // Cast the chosen classification id to an integer for safer downstream use.
      .toInt(),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
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

  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Rebuild the select list and refill the rest of the form inputs.
    const classificationList = await utilities.buildClassificationList(
      classification_id
    )

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      errors,
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

  next()
}

/* ******************************
 * Check update data and return errors to edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
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
  } = req.body

  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    // The edit view needs inv_id returned too so a later successful submit still knows which row to update.
    const classificationList = await utilities.buildClassificationList(
      classification_id
    )
    const itemName = `${inv_make} ${inv_model}`

    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      errors,
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

  next()
}

module.exports = validate
