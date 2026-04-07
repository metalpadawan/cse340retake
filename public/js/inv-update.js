// Edit-inventory page script:
// keep the update button disabled until the user changes something in the form.
const form = document.querySelector("#updateForm")

if (form) {
  form.addEventListener("change", function () {
    const updateBtn = form.querySelector("button[type='submit']")

    if (updateBtn) {
      // Once any field changes, allow the update request to be submitted.
      updateBtn.removeAttribute("disabled")
    }
  })
}
