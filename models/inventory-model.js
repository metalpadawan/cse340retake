const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  // Return every classification so the navigation can be built in alphabetical order.
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    // Join inventory with classification so each vehicle record also includes its category name.
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    // Log database issues here to make route failures easier to trace.
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a single inventory item by inventory id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    // Use a parameterized query to safely retrieve a single vehicle with its classification name.
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error " + error)
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function insertClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Check if classification already exists
 * ************************** */
async function checkExistingClassification(classification_name) {
  try {
    const sql =
      "SELECT * FROM public.classification WHERE LOWER(classification_name) = LOWER($1)"
    const data = await pool.query(sql, [classification_name])
    return data.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function insertInventory(
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
) {
  try {
    const sql = `INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`
    return await pool.query(sql, [
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
    ])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update inventory data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `UPDATE public.inventory
      SET inv_make = $1,
          inv_model = $2,
          inv_description = $3,
          inv_image = $4,
          inv_thumbnail = $5,
          inv_price = $6,
          inv_year = $7,
          inv_miles = $8,
          inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *`

    const data = await pool.query(sql, [
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
      inv_id,
    ])

    return data.rows[0]
  } catch (error) {
    console.error("updateInventory error " + error)
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  insertClassification,
  checkExistingClassification,
  insertInventory,
  updateInventory,
}
