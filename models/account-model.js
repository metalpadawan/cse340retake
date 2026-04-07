// Account model: all database access for account registration, lookup, and updates.
const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    // Store the new account with a default Client role; the password is already hashed upstream.
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    // Return the error message if the insert fails.
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email, account_id = null){
  try {
    // Optionally exclude the current account id so a user can keep their existing email on update.
    let sql = "SELECT * FROM account WHERE account_email = $1"
    let params = [account_email]

    if (account_id) {
      sql += " AND account_id <> $2"
      params.push(account_id)
    }

    const email = await pool.query(sql, params)
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
 * Return account data using email address
 * *************************** */
async function getAccountByEmail(account_email) {
  try {
    // Include the password hash here because login needs it for bcrypt comparison.
    const sql =
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
 * Return account data using account id
 * *************************** */
async function getAccountById(account_id) {
  try {
    // Exclude the password hash because most account-management views do not need it.
    const sql =
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1"
    const result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
 * Update account information
 * *************************** */
async function updateAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_id
) {
  try {
    // Update only the profile fields that can be edited in the account update form.
    const sql = `UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type`
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* *****************************
 * Update account password
 * *************************** */
async function updatePassword(account_password, account_id) {
  try {
    // Save the newly hashed password for the requested account id.
    const sql = `UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING account_id`
    const result = await pool.query(sql, [account_password, account_id])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
}
