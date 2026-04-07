// Database connection helper: exports a pg Pool configured for the current environment.
const { Pool } = require("pg")
require("dotenv").config()
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
  // Local development uses SSL for this hosted database connection.
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
})

// In development, wrap pool.query so executed SQL is easier to trace in the terminal.
module.exports = {
  async query(text, params) {
    try {
      // Wrap pool.query so each development query can be logged for troubleshooting.
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
}
} else {
  // Production uses the plain pool export because query logging is less helpful there.
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  module.exports = pool
}
