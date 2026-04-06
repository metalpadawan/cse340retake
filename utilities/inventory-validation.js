const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")

const validate = {}

/* ******************************
 * Classification data validation rules
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .bail()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters.")
      .bail()
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
