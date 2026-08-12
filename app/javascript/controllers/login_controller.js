import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["form", "email", "password", "message", "submit"]

  connect() {
    if (this.hasMessageTarget) {
      this.messageTarget.textContent = ""
    }
  }

  async submit(event) {
    event.preventDefault()
    if (!this.hasFormTarget) return

    const url = this.formTarget.action
    const token = document.querySelector('meta[name="csrf-token"]').content

    this.submitTarget.disabled = true
    this.messageTarget.textContent = "Signing in..."

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": token,
        },
        body: JSON.stringify({
          email: this.emailTarget.value,
          password: this.passwordTarget.value,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        window.location.href = data.redirect_url || "/"
      } else {
        this.messageTarget.textContent = data.error || "Invalid credentials."
      }
    } catch (error) {
      this.messageTarget.textContent = "Network error. Please try again."
    } finally {
      this.submitTarget.disabled = false
    }
  }
}
