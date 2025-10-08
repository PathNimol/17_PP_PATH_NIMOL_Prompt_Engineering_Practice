/**
 * ToastManager - Handles toast notifications
 */

export class ToastManager {
  constructor() {
    this.toastElement = null;
    this.toastInstance = null;
    this.undoTimeout = null;
    this.init();
  }

  /**
   * Initialize toast manager
   */
  init() {
    this.toastElement = document.getElementById("toast");
    if (this.toastElement) {
      this.toastInstance = new bootstrap.Toast(this.toastElement, {
        autohide: true,
        delay: 5000,
      });
    }
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  show(message, type = "success", duration = 5000) {
    if (!this.toastElement) return;

    // Update toast content
    this.updateToastContent(message, type);

    // Show toast
    if (this.toastInstance) {
      this.toastInstance.show();
    }

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Show toast with undo action
   * @param {string} message - Toast message
   * @param {Function} undoCallback - Callback function for undo action
   * @param {number} duration - Duration in milliseconds
   */
  showWithUndo(message, undoCallback, duration = 5000) {
    if (!this.toastElement) return;

    // Update toast content with undo button
    this.updateToastContentWithUndo(message, undoCallback);

    // Show toast
    if (this.toastInstance) {
      this.toastInstance.show();
    }

    // Clear any existing undo timeout
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
    }

    // Auto-hide after duration
    if (duration > 0) {
      this.undoTimeout = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Hide toast
   */
  hide() {
    if (this.toastInstance) {
      this.toastInstance.hide();
    }
  }

  /**
   * Update toast content
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   */
  updateToastContent(message, type) {
    const header = this.toastElement.querySelector(".toast-header");
    const body = this.toastElement.querySelector(".toast-body");
    const icon = header.querySelector("i");

    // Update icon and colors based on type
    const typeConfig = this.getTypeConfig(type);

    icon.className = typeConfig.iconClass;
    icon.style.color = typeConfig.iconColor;

    header.style.backgroundColor = typeConfig.headerBg;
    header.style.borderBottomColor = typeConfig.borderColor;

    // Update message
    body.textContent = message;
  }

  /**
   * Update toast content with undo button
   * @param {string} message - Toast message
   * @param {Function} undoCallback - Undo callback function
   */
  updateToastContentWithUndo(message, undoCallback) {
    const header = this.toastElement.querySelector(".toast-header");
    const body = this.toastElement.querySelector(".toast-body");
    const icon = header.querySelector("i");

    // Set success type for undo toasts
    const typeConfig = this.getTypeConfig("success");

    icon.className = typeConfig.iconClass;
    icon.style.color = typeConfig.iconColor;

    header.style.backgroundColor = typeConfig.headerBg;
    header.style.borderBottomColor = typeConfig.borderColor;

    // Update message with undo button
    body.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${message}</span>
                <button class="btn btn-sm btn-outline-primary ms-3" onclick="todoApp.toastManager.performUndo()">
                    Undo
                </button>
            </div>
        `;

    // Store undo callback
    this.undoCallback = undoCallback;
  }

  /**
   * Perform undo action
   */
  performUndo() {
    if (this.undoCallback && typeof this.undoCallback === "function") {
      this.undoCallback();
      this.hide();
    }
  }

  /**
   * Get type configuration
   * @param {string} type - Toast type
   * @returns {Object} Type configuration
   */
  getTypeConfig(type) {
    const configs = {
      success: {
        iconClass: "bi bi-check-circle-fill text-success me-2",
        iconColor: "#198754",
        headerBg: "#d1e7dd",
        borderColor: "#badbcc",
      },
      error: {
        iconClass: "bi bi-exclamation-triangle-fill text-danger me-2",
        iconColor: "#dc3545",
        headerBg: "#f8d7da",
        borderColor: "#f5c2c7",
      },
      warning: {
        iconClass: "bi bi-exclamation-triangle-fill text-warning me-2",
        iconColor: "#ffc107",
        headerBg: "#fff3cd",
        borderColor: "#ffecb5",
      },
      info: {
        iconClass: "bi bi-info-circle-fill text-info me-2",
        iconColor: "#0dcaf0",
        headerBg: "#d1ecf1",
        borderColor: "#bee5eb",
      },
    };

    return configs[type] || configs.success;
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   */
  success(message) {
    this.show(message, "success");
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  error(message) {
    this.show(message, "error");
  }

  /**
   * Show warning toast
   * @param {string} message - Warning message
   */
  warning(message) {
    this.show(message, "warning");
  }

  /**
   * Show info toast
   * @param {string} message - Info message
   */
  info(message) {
    this.show(message, "info");
  }

  /**
   * Show custom toast with HTML content
   * @param {string} htmlContent - HTML content for toast body
   * @param {string} type - Toast type
   * @param {number} duration - Duration in milliseconds
   */
  showCustom(htmlContent, type = "info", duration = 5000) {
    if (!this.toastElement) return;

    const header = this.toastElement.querySelector(".toast-header");
    const body = this.toastElement.querySelector(".toast-body");
    const icon = header.querySelector("i");

    // Update icon and colors based on type
    const typeConfig = this.getTypeConfig(type);

    icon.className = typeConfig.iconClass;
    icon.style.color = typeConfig.iconColor;

    header.style.backgroundColor = typeConfig.headerBg;
    header.style.borderBottomColor = typeConfig.borderColor;

    // Update body with HTML content
    body.innerHTML = htmlContent;

    // Show toast
    if (this.toastInstance) {
      this.toastInstance.show();
    }

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Show progress toast
   * @param {string} message - Progress message
   * @param {number} progress - Progress percentage (0-100)
   */
  showProgress(message, progress = 0) {
    const progressBar = `
            <div class="progress mt-2" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: ${progress}%" 
                     aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;

    this.showCustom(message + progressBar, "info", 0); // Don't auto-hide progress toasts
  }

  /**
   * Update progress toast
   * @param {number} progress - Progress percentage (0-100)
   */
  updateProgress(progress) {
    const progressBar = this.toastElement.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute("aria-valuenow", progress);
    }
  }

  /**
   * Show multiple toasts in sequence
   * @param {Array} toastData - Array of toast data objects
   * @param {number} delay - Delay between toasts in milliseconds
   */
  showSequence(toastData, delay = 1000) {
    toastData.forEach((data, index) => {
      setTimeout(() => {
        this.show(data.message, data.type, data.duration);
      }, index * delay);
    });
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    this.hide();
    if (this.undoTimeout) {
      clearTimeout(this.undoTimeout);
      this.undoTimeout = null;
    }
  }
}
