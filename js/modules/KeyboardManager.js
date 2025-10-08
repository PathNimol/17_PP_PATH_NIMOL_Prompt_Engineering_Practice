/**
 * KeyboardManager - Handles keyboard shortcuts and accessibility
 */

export class KeyboardManager {
  constructor() {
    this.app = null;
    this.shortcuts = new Map();
    this.isModalOpen = false;
  }

  /**
   * Initialize keyboard manager
   * @param {Object} app - Main app instance
   */
  init(app) {
    this.app = app;
    this.setupKeyboardShortcuts();
    this.setupAccessibility();
    this.setupEventListeners();
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Define shortcuts
    this.shortcuts.set("n", () => this.app.showAddTaskModal());
    this.shortcuts.set("f", () => this.focusSearch());
    this.shortcuts.set("d", () => this.app.showSection("dashboard"));
    this.shortcuts.set("t", () => this.app.showSection("tasks"));
    this.shortcuts.set("h", () => this.app.showSection("history"));
    this.shortcuts.set("escape", () => this.handleEscape());
    this.shortcuts.set("ctrl+s", (e) => this.handleSave(e));
    this.shortcuts.set("ctrl+e", (e) => this.handleExport(e));
    this.shortcuts.set("ctrl+i", (e) => this.handleImport(e));
    this.shortcuts.set("ctrl+d", (e) => this.handleDarkMode(e));
    this.shortcuts.set("ctrl+/", (e) => this.showShortcuts(e));
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA labels to interactive elements
    this.addAriaLabels();

    // Setup focus management
    this.setupFocusManagement();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Global keyboard event listener
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    // Modal event listeners
    document.addEventListener("shown.bs.modal", (e) => {
      this.isModalOpen = true;
      this.trapFocusInModal(e.target);
    });

    document.addEventListener("hidden.bs.modal", (e) => {
      this.isModalOpen = false;
      this.restoreFocusAfterModal();
    });

    // Focus management for sidebar
    document.addEventListener("click", (e) => {
      if (e.target.closest(".sidebar")) {
        this.handleSidebarFocus(e);
      }
    });
  }

  /**
   * Handle key down events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    // Don't handle shortcuts when typing in inputs
    if (this.isTypingInInput(e.target)) {
      return;
    }

    // Check for modifier keys
    const hasCtrl = e.ctrlKey || e.metaKey;
    const hasShift = e.shiftKey;
    const hasAlt = e.altKey;

    // Build shortcut key
    let shortcutKey = "";
    if (hasCtrl) shortcutKey += "ctrl+";
    if (hasShift) shortcutKey += "shift+";
    if (hasAlt) shortcutKey += "alt+";
    shortcutKey += e.key.toLowerCase();

    // Execute shortcut if found
    const shortcut =
      this.shortcuts.get(shortcutKey) ||
      this.shortcuts.get(e.key.toLowerCase());
    if (shortcut) {
      e.preventDefault();
      shortcut(e);
    }
  }

  /**
   * Check if user is typing in an input field
   * @param {HTMLElement} target - Target element
   * @returns {boolean} True if typing in input
   */
  isTypingInInput(target) {
    const inputTypes = ["input", "textarea", "select"];
    return (
      inputTypes.includes(target.tagName.toLowerCase()) ||
      target.contentEditable === "true" ||
      target.closest('[contenteditable="true"]')
    );
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.getElementById("searchTasks");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    if (this.isModalOpen) {
      // Close any open modals
      const modals = document.querySelectorAll(".modal.show");
      modals.forEach((modal) => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    } else {
      // Clear search if focused
      const searchInput = document.getElementById("searchTasks");
      if (document.activeElement === searchInput) {
        searchInput.value = "";
        this.app.currentSearch = "";
        this.app.render();
      }
    }
  }

  /**
   * Handle save shortcut
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleSave(e) {
    e.preventDefault();
    const saveBtn = document.getElementById("saveTaskBtn");
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.click();
    }
  }

  /**
   * Handle export shortcut
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleExport(e) {
    e.preventDefault();
    this.app.exportTasks();
  }

  /**
   * Handle import shortcut
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleImport(e) {
    e.preventDefault();
    document.getElementById("importFileInput").click();
  }

  /**
   * Handle dark mode toggle shortcut
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleDarkMode(e) {
    e.preventDefault();
    const toggle = document.getElementById("darkModeToggle");
    if (toggle) {
      toggle.checked = !toggle.checked;
      toggle.dispatchEvent(new Event("change"));
    }
  }

  /**
   * Show shortcuts help
   * @param {KeyboardEvent} e - Keyboard event
   */
  showShortcuts(e) {
    e.preventDefault();
    this.showShortcutsModal();
  }

  /**
   * Show shortcuts modal
   */
  showShortcutsModal() {
    const shortcutsList = this.getShortcutsList();
    const modalHtml = `
            <div class="modal fade" id="shortcutsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Keyboard Shortcuts</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                ${shortcutsList
                                  .map(
                                    (category) => `
                                    <div class="col-md-6 mb-4">
                                        <h6>${category.title}</h6>
                                        <ul class="list-unstyled">
                                            ${category.shortcuts
                                              .map(
                                                (shortcut) => `
                                                <li class="mb-2">
                                                    <kbd class="me-2">${shortcut.key}</kbd>
                                                    <span>${shortcut.description}</span>
                                                </li>
                                            `
                                              )
                                              .join("")}
                                        </ul>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remove existing modal if present
    const existingModal = document.getElementById("shortcutsModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("shortcutsModal")
    );
    modal.show();

    // Clean up when hidden
    document
      .getElementById("shortcutsModal")
      .addEventListener("hidden.bs.modal", () => {
        document.getElementById("shortcutsModal").remove();
      });
  }

  /**
   * Get shortcuts list for display
   * @returns {Array} Shortcuts list
   */
  getShortcutsList() {
    return [
      {
        title: "Navigation",
        shortcuts: [
          { key: "N", description: "Add new task" },
          { key: "F", description: "Focus search" },
          { key: "D", description: "Go to Dashboard" },
          { key: "T", description: "Go to Tasks" },
          { key: "H", description: "Go to History" },
        ],
      },
      {
        title: "Actions",
        shortcuts: [
          { key: "Ctrl+S", description: "Save task (in modal)" },
          { key: "Ctrl+E", description: "Export tasks" },
          { key: "Ctrl+I", description: "Import tasks" },
          { key: "Ctrl+D", description: "Toggle dark mode" },
          { key: "Ctrl+/", description: "Show shortcuts" },
        ],
      },
      {
        title: "General",
        shortcuts: [
          { key: "Esc", description: "Close modal or clear search" },
          { key: "Tab", description: "Navigate between elements" },
          { key: "Enter", description: "Activate focused element" },
          { key: "Space", description: "Toggle checkboxes/buttons" },
        ],
      },
    ];
  }

  /**
   * Add ARIA labels to elements
   */
  addAriaLabels() {
    // Add ARIA labels to buttons
    const buttons = document.querySelectorAll(
      "button:not([aria-label]):not([aria-labelledby])"
    );
    buttons.forEach((button) => {
      if (!button.textContent.trim() && button.querySelector("i")) {
        const icon = button.querySelector("i");
        const iconClass = icon.className;
        let label = "";

        if (iconClass.includes("plus")) label = "Add new task";
        else if (iconClass.includes("pencil")) label = "Edit task";
        else if (iconClass.includes("trash")) label = "Delete task";
        else if (iconClass.includes("eye")) label = "View task details";
        else if (iconClass.includes("grip")) label = "Drag to reorder";

        if (label) {
          button.setAttribute("aria-label", label);
        }
      }
    });

    // Add ARIA labels to form controls
    const inputs = document.querySelectorAll(
      "input:not([aria-label]):not([aria-labelledby])"
    );
    inputs.forEach((input) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label && !input.getAttribute("aria-label")) {
        input.setAttribute("aria-label", label.textContent);
      }
    });
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Add focus indicators
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Handle arrow key navigation in task lists
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const taskItem = e.target.closest(".task-item");
        if (taskItem) {
          this.navigateTaskItems(e, taskItem);
        }
      }
    });
  }

  /**
   * Navigate between task items
   * @param {KeyboardEvent} e - Keyboard event
   * @param {HTMLElement} currentItem - Current task item
   */
  navigateTaskItems(e, currentItem) {
    e.preventDefault();

    const taskItems = Array.from(document.querySelectorAll(".task-item"));
    const currentIndex = taskItems.indexOf(currentItem);

    let targetIndex;
    if (e.key === "ArrowUp") {
      targetIndex = Math.max(0, currentIndex - 1);
    } else {
      targetIndex = Math.min(taskItems.length - 1, currentIndex + 1);
    }

    if (targetIndex !== currentIndex) {
      const targetItem = taskItems[targetIndex];
      const focusableElement = targetItem.querySelector(
        "button, input, [tabindex]"
      );
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }

  /**
   * Trap focus in modal
   * @param {HTMLElement} modal - Modal element
   */
  trapFocusInModal(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });

    // Focus first element
    firstElement.focus();
  }

  /**
   * Restore focus after modal closes
   */
  restoreFocusAfterModal() {
    const triggerElement = document.activeElement;
    if (triggerElement && triggerElement.closest(".modal")) {
      // Find the element that opened the modal
      const openButton = document.querySelector(
        '[data-bs-toggle="modal"]:focus'
      );
      if (openButton) {
        openButton.focus();
      }
    }
  }

  /**
   * Handle sidebar focus
   * @param {Event} e - Event
   */
  handleSidebarFocus(e) {
    const navLink = e.target.closest(".nav-link");
    if (navLink) {
      navLink.focus();
    }
  }

  /**
   * Add keyboard navigation styles
   */
  addKeyboardStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            .keyboard-navigation button:focus,
            .keyboard-navigation .nav-link:focus {
                box-shadow: 0 0 0 2px var(--primary-color) !important;
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Register custom shortcut
   * @param {string} key - Shortcut key
   * @param {Function} callback - Callback function
   */
  registerShortcut(key, callback) {
    this.shortcuts.set(key, callback);
  }

  /**
   * Unregister shortcut
   * @param {string} key - Shortcut key
   */
  unregisterShortcut(key) {
    this.shortcuts.delete(key);
  }

  /**
   * Get all registered shortcuts
   * @returns {Map} Shortcuts map
   */
  getShortcuts() {
    return this.shortcuts;
  }
}
