'use strict'

// Inventory management page script:
// listens for classification changes, requests matching inventory rows,
// then builds the management table in the browser.
const classificationList = document.querySelector("#classificationList")

if (classificationList) {
  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value
    const inventoryDisplay = document.getElementById("inventoryDisplay")

    console.log(`classification_id is: ${classification_id}`)

    // Clear the table when the placeholder option is selected.
    if (!classification_id) {
      inventoryDisplay.innerHTML = ""
      return
    }

    // Request the JSON data for the selected classification.
    const classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json()
        }
        throw Error("Network response was not OK")
      })
      .then(function (data) {
        console.log(data)
        // Convert the returned JSON rows into table markup.
        buildInventoryList(data)
      })
      .catch(function (error) {
        console.log("There was a problem: ", error.message)
      })
  })
}

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay")

  // Set up the table labels
  let dataTable = "<thead>"
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>"
  dataTable += "</thead>"

  // Set up the table body
  dataTable += "<tbody>"

  if (data.length === 0) {
    // Show an explicit empty-state row instead of leaving the table blank.
    dataTable += "<tr><td colspan='3'>No inventory items were found for this classification.</td></tr>"
  } else {
    // Iterate over all vehicles in the array and put each in a row
    data.forEach(function (element) {
      console.log(element.inv_id + ", " + element.inv_model)
      dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`
      dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`
      dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`
    })
  }

  dataTable += "</tbody>"

  // Display the contents in the Inventory Management view
  inventoryDisplay.innerHTML = dataTable
}
