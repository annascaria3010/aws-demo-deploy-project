import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["status", "nameInput", "namesList", "message"]

  connect() {
    this.names = []
    this.loadCurrentUser()
    this.loadNames()
  }

  async loadCurrentUser() {
    if (!this.hasStatusTarget) return

    try {
      const response = await fetch("/api/me", { headers: { Accept: "application/json" } })
      const data = await response.json()

      if (response.ok && data.logged_in) {
        this.statusTarget.innerHTML = `You are signed in as <strong>${data.user.email}</strong>.`
      } else {
        window.location.href = "/login"
      }
    } catch (error) {
      this.statusTarget.textContent = "Unable to load account info."
    }
  }

  async loadNames() {
    try {
      const response = await fetch("/api/names", { headers: { Accept: "application/json" } })
      if (!response.ok) throw new Error("Unable to load names")

      this.names = await response.json()
      this.renderNames()
    } catch (error) {
      this.names = []
      this.renderNames()
    }
  }

  async addName(event) {
    event.preventDefault()
    if (!this.hasNameInputTarget) return

    const name = this.nameInputTarget.value.trim()
    if (!name) {
      if (this.hasMessageTarget) this.messageTarget.textContent = "Please enter a name."
      return
    }

    if (this.hasMessageTarget) this.messageTarget.textContent = ""
    const token = document.querySelector('meta[name="csrf-token"]').content

    try {
      const response = await fetch("/api/names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": token,
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        this.names.unshift(data.client)
        this.nameInputTarget.value = ""
        this.renderNames()
      } else {
        if (this.hasMessageTarget) {
          this.messageTarget.textContent = data.errors ? data.errors.join(", ") : data.error || "Unable to save name."
        }
      }
    } catch (error) {
      if (this.hasMessageTarget) this.messageTarget.textContent = "Network error. Please try again."
    }
  }

  async deleteName(event) {
    const id = event.currentTarget.dataset.id
    if (!id) return

    const token = document.querySelector('meta[name="csrf-token"]').content

    try {
      const response = await fetch(`/api/names/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token": token,
        },
      })

      const data = await response.json()
      if (response.ok && data.success) {
        this.names = this.names.filter((item) => item.id !== Number(id))
        this.renderNames()
      } else if (this.hasMessageTarget) {
        this.messageTarget.textContent = data.error || "Unable to delete name."
      }
    } catch (error) {
      if (this.hasMessageTarget) this.messageTarget.textContent = "Network error. Please try again."
    }
  }

  renderNames() {
    if (!this.hasNamesListTarget) return

    if (this.names.length === 0) {
      this.namesListTarget.innerHTML = `
        <tr>
          <td colspan="3" style="padding:0.75rem; color:#666;">No names added yet.</td>
        </tr>`
      return
    }

    this.namesListTarget.innerHTML = this.names
      .map((item, index) => {
        const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : "-"
        return `
          <tr>
            <td style="padding:0.75rem; border-top:1px solid #eee;">${index + 1}</td>
            <td style="padding:0.75rem; border-top:1px solid #eee;">${item.name}</td>
            <td style="padding:0.75rem; border-top:1px solid #eee;">${createdAt}</td>
            <td style="padding:0.75rem; border-top:1px solid #eee;">
              <button type="button" data-action="click->home#deleteName" data-id="${item.id}" style="padding:0.4rem 0.75rem;">Delete</button>
            </td>
          </tr>`
      })
      .join("")
  }
}