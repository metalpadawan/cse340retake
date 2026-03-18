const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  // Return every classification so the navigation can be built in alphabetical order.
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = { getClassifications }

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

module.exports = {getClassifications, getInventoryByClassificationId};
