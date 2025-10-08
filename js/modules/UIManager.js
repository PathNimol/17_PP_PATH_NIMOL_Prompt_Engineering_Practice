/**
 * UIManager - Handles UI rendering and interactions
 */

export class UIManager {
  constructor() {
    this.modals = {};
  }

  /**
   * Initialize UI components
   */
  init() {
    this.initModals();
    this.initTooltips();
  }

  /**
   * Initialize Bootstrap modals
   */
  initModals() {
    const modalElements = document.querySelectorAll(".modal");
    modalElements.forEach((element) => {
      this.modals[element.id] = new bootstrap.Modal(element);
    });
  }

  /**
   * Initialize Bootstrap tooltips
   */
  initTooltips() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  /**
   * Render task card HTML
   * @param {Object} task - Task object
   * @param {boolean} isCompact - Whether to render compact version
   * @returns {string} HTML string
   */
  renderTaskCard(task, isCompact = false) {
    const isOverdue = this.isTaskOverdue(task);
    const dueDateFormatted = task.dueDate
      ? this.formatDate(task.dueDate)
      : null;

    const statusClass = task.status === "completed" ? "completed" : "";
    const overdueClass = isOverdue ? "overdue" : "";

    return `
            <div class="task-item ${statusClass} ${overdueClass}" data-task-id="${
      task.id
    }">
                <div class="task-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="todoApp.showTaskDetails(${
                      task.id
                    })" 
                            data-bs-toggle="tooltip" title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="todoApp.showEditTaskModal(${
                      task.id
                    })" 
                            data-bs-toggle="tooltip" title="Edit Task">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="todoApp.deleteTask(${
                      task.id
                    })" 
                            data-bs-toggle="tooltip" title="Delete Task">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                
                <div class="d-flex align-items-start">
                    <div class="form-check me-2">
                        <input class="form-check-input" type="checkbox" 
                               ${task.status === "completed" ? "checked" : ""} 
                               onchange="todoApp.toggleTaskStatus(${task.id})"
                               data-bs-toggle="tooltip" title="Toggle Status">
                    </div>
                    
                    <div class="flex-grow-1">
                        <div class="task-title">${this.escapeHtml(
                          task.title
                        )}</div>
                        ${
                          task.description && !isCompact
                            ? `<div class="task-description">${this.escapeHtml(
                                task.description
                              )}</div>`
                            : ""
                        }
                        
                        <div class="task-meta">
                            <div class="d-flex align-items-center gap-2">
                                <span class="status-badge ${
                                  task.status
                                }">${this.formatStatus(task.status)}</span>
                                ${
                                  dueDateFormatted
                                    ? `
                                    <span class="task-due-date ${
                                      isOverdue ? "overdue" : ""
                                    }">
                                        <i class="bi bi-calendar-event"></i>
                                        ${dueDateFormatted}
                                    </span>
                                `
                                    : ""
                                }
                            </div>
                            ${
                              !isCompact
                                ? `
                                <div class="text-muted small">
                                    Created ${this.formatRelativeTime(
                                      task.createdAt
                                    )}
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                    
                    <div class="drag-handle ms-2" data-bs-toggle="tooltip" title="Drag to reorder">
                        <i class="bi bi-grip-vertical"></i>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Render task details HTML
   * @param {Object} task - Task object
   * @returns {string} HTML string
   */
  renderTaskDetails(task) {
    const isOverdue = this.isTaskOverdue(task);
    const dueDateFormatted = task.dueDate
      ? this.formatDate(task.dueDate)
      : "No due date";
    const completedAtFormatted = task.completedAt
      ? this.formatDate(task.completedAt)
      : null;

    return `
            <div class="task-details">
                <div class="row">
                    <div class="col-md-8">
                        <h4 class="mb-3">${this.escapeHtml(task.title)}</h4>
                        
                        ${
                          task.description
                            ? `
                            <div class="mb-3">
                                <h6>Description</h6>
                                <p class="text-muted">${this.escapeHtml(
                                  task.description
                                )}</p>
                            </div>
                        `
                            : ""
                        }
                        
                        <div class="row mb-3">
                            <div class="col-sm-6">
                                <h6>Status</h6>
                                <span class="status-badge ${
                                  task.status
                                }">${this.formatStatus(task.status)}</span>
                            </div>
                            <div class="col-sm-6">
                                <h6>Due Date</h6>
                                <span class="${
                                  isOverdue
                                    ? "text-danger fw-semibold"
                                    : "text-muted"
                                }">
                                    ${dueDateFormatted}
                                </span>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-sm-6">
                                <h6>Created</h6>
                                <span class="text-muted">${this.formatDate(
                                  task.createdAt
                                )}</span>
                            </div>
                            <div class="col-sm-6">
                                <h6>Last Updated</h6>
                                <span class="text-muted">${this.formatDate(
                                  task.updatedAt
                                )}</span>
                            </div>
                        </div>
                        
                        ${
                          completedAtFormatted
                            ? `
                            <div class="mt-3">
                                <h6>Completed</h6>
                                <span class="text-success">${completedAtFormatted}</span>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">Quick Actions</h6>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="todoApp.showEditTaskModal(${
                                      task.id
                                    })">
                                        <i class="bi bi-pencil me-2"></i>Edit Task
                                    </button>
                                    <button class="btn btn-${
                                      task.status === "completed"
                                        ? "warning"
                                        : "success"
                                    }" 
                                            onclick="todoApp.toggleTaskStatus(${
                                              task.id
                                            })">
                                        <i class="bi bi-${
                                          task.status === "completed"
                                            ? "arrow-counterclockwise"
                                            : "check"
                                        } me-2"></i>
                                        ${
                                          task.status === "completed"
                                            ? "Reopen"
                                            : "Complete"
                                        }
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="todoApp.deleteTask(${
                                      task.id
                                    })">
                                        <i class="bi bi-trash me-2"></i>Delete Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Render history item HTML
   * @param {Object} entry - History entry object
   * @returns {string} HTML string
   */
  renderHistoryItem(entry) {
    return `
            <div class="history-item">
                <div class="history-time">${this.formatDate(
                  entry.timestamp
                )}</div>
                <div class="history-action">${this.escapeHtml(
                  entry.action
                )}</div>
                <div class="history-details">${this.escapeHtml(
                  entry.details
                )}</div>
            </div>
        `;
  }

  /**
   * Show loading state
   * @param {string} elementId - Element ID to show loading state
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("loading");
      element.innerHTML =
        '<div class="text-center"><div class="spinner"></div> Loading...</div>';
    }
  }

  /**
   * Hide loading state
   * @param {string} elementId - Element ID to hide loading state
   */
  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("loading");
    }
  }

  /**
   * Show empty state
   * @param {string} elementId - Element ID to show empty state
   * @param {string} icon - Icon class
   * @param {string} title - Empty state title
   * @param {string} message - Empty state message
   */
  showEmptyState(elementId, icon, title, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
                <div class="empty-state">
                    <i class="bi ${icon}"></i>
                    <h5>${title}</h5>
                    <p>${message}</p>
                </div>
            `;
    }
  }

  /**
   * Add animation class to element
   * @param {string} elementId - Element ID
   * @param {string} animationClass - Animation class to add
   */
  animateElement(elementId, animationClass) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add(animationClass);
      setTimeout(() => {
        element.classList.remove(animationClass);
      }, 300);
    }
  }

  /**
   * Check if task is overdue
   * @param {Object} task - Task object
   * @returns {boolean} True if task is overdue
   */
  isTaskOverdue(task) {
    if (!task.dueDate || task.status === "completed") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  /**
   * Format date string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Format relative time
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted relative time
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return this.formatDate(dateString);
  }

  /**
   * Format status string
   * @param {string} status - Task status
   * @returns {string} Formatted status
   */
  formatStatus(status) {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show modal
   * @param {string} modalId - Modal ID
   */
  showModal(modalId) {
    if (this.modals[modalId]) {
      this.modals[modalId].show();
    }
  }

  /**
   * Hide modal
   * @param {string} modalId - Modal ID
   */
  hideModal(modalId) {
    if (this.modals[modalId]) {
      this.modals[modalId].hide();
    }
  }

  /**
   * Update page title
   * @param {string} title - New page title
   */
  updatePageTitle(title) {
    document.getElementById("pageTitle").textContent = title;
  }

  /**
   * Update active navigation
   * @param {string} section - Section name
   */
  updateActiveNavigation(section) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");
  }

  /**
   * Show/hide sections
   * @param {string} activeSection - Active section name
   */
  toggleSections(activeSection) {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.add("d-none");
    });
    document
      .getElementById(`${activeSection}-section`)
      .classList.remove("d-none");
  }

  /**
   * Focus element
   * @param {string} elementId - Element ID to focus
   */
  focusElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }

  /**
   * Scroll to element
   * @param {string} elementId - Element ID to scroll to
   */
  scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}
