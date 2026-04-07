const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
const path = require("path")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (currentPath = "/", activeClassificationId = null) {
  let data = await invModel.getClassifications()
  // Start the navigation list with a permanent link back to the home page.
  let list = "<ul>"
  const homeActive = currentPath === "/"
  list += "<li>"
  list += `<a href="/" title="Home page"${homeActive ? ' class="nav-active" aria-current="page"' : ""}>Home</a>`
  list += "</li>"
  data.rows.forEach((row) => {
    const classificationPath = `/inv/type/${row.classification_id}`
    const isActive =
      activeClassificationId == row.classification_id ||
      currentPath.startsWith(classificationPath)
    list += "<li>"
    // Each classification becomes a clickable route to that category page.
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ` vehicles"${isActive ? ' class="nav-active" aria-current="page"' : ""}>` +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Normalize stored vehicle image paths
 * ************************************ */
Util.resolveVehicleImagePath = function (
  imagePath,
  fallback = "/images/vehicles/no-image.png"
) {
  if (!imagePath || typeof imagePath !== "string") {
    return fallback
  }

  const cleanedPath = imagePath.trim().replace(/\\/g, "/")
  const fileName = path.posix.basename(cleanedPath)

  if (!fileName || fileName === "." || fileName === "/") {
    return fallback
  }

  return `/images/vehicles/${fileName}`
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ""
  if(data.length > 0){
    // Build one card-like list item for every returned vehicle.
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      const thumbnailPath = Util.resolveVehicleImagePath(
        vehicle.inv_thumbnail,
        "/images/vehicles/no-image-tn.png"
      )
      const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`
      grid += `
        <li>
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicleName} details">
            <img
              src="${thumbnailPath}"
              alt="Image of ${vehicleName} on CSE Motors"
              onerror="this.onerror=null;this.src='/images/vehicles/no-image-tn.png';"
            />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicleName} details">${vehicleName}</a>
            </h2>
            <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
          </div>
        </li>`
    })
    grid += '</ul>'
  } else { 
    // Show a friendly message instead of an empty list when nothing matches.
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
  const imagePath = Util.resolveVehicleImagePath(vehicle.inv_image)
  // Wrap the vehicle's data in a structured HTML block for the detail view.
  return `
    <section class="vehicle-detail">
      <img 
        src="${imagePath}" 
        alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" 
        class="vehicle-detail__image"
        onerror="this.onerror=null;this.src='/images/vehicles/no-image.png';"
      />
      <div class="vehicle-detail__info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <!-- Format price as US currency with symbol and commas -->
        <p class="vehicle-detail__price">
          <strong>Price:</strong> 
          ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(vehicle.inv_price)}
        </p>
        <!-- Format mileage with place value commas -->
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>
  `
}

/* **************************************
 * Build the classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" class="inventory-form__select" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  res.locals.loggedin = 0

  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("notice", "Please log in.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }

        res.locals.loggedin = 1
        res.locals.accountData = accountData
        return next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    return next()
  }

  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
}

/* ****************************************
 *  Check employee or admin account type
 * ************************************ */
Util.checkAccountType = async (req, res, next) => {
  const nav = await Util.getNav()
  const accountType = res.locals.accountData
    ? res.locals.accountData.account_type
    : null

  if (
    res.locals.loggedin &&
    (accountType === "Employee" || accountType === "Admin")
  ) {
    return next()
  }

  req.flash(
    "notice",
    "Please log in with an employee or admin account to access that area."
  )
  return res.status(403).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  })
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
