/**
 * DragDropManager - Handles drag and drop functionality using SortableJS
 */

export class DragDropManager {
  constructor() {
    this.sortableInstances = {};
    this.app = null;
  }

  /**
   * Initialize drag and drop functionality
   * @param {Object} app - Main app instance
   */
  init(app) {
    this.app = app;
    this.initSortableLists();
  }

  /**
   * Initialize sortable lists for each task column
   */
  initSortableLists() {
    const taskLists = [
      "activeTasksList",
      "inProgressTasksList",
      "completedTasksList",
    ];

    taskLists.forEach((listId) => {
      const element = document.getElementById(listId);
      if (element) {
        this.createSortableInstance(element, listId);
      }
    });
  }

  /**
   * Create sortable instance for a task list
   * @param {HTMLElement} element - DOM element
   * @param {string} listId - List ID
   */
  createSortableInstance(element, listId) {
    const status = element.dataset.status;

    this.sortableInstances[listId] = new Sortable(element, {
      group: "tasks",
      animation: 200,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      handle: ".drag-handle",
      forceFallback: true,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: true,
      swapThreshold: 0.65,

      onStart: (evt) => {
        this.onDragStart(evt, status);
      },

      onEnd: (evt) => {
        this.onDragEnd(evt, status);
      },

      onAdd: (evt) => {
        this.onTaskAdded(evt, status);
      },

      onRemove: (evt) => {
        this.onTaskRemoved(evt, status);
      },

      onUpdate: (evt) => {
        this.onTaskMoved(evt, status);
      },
    });
  }

  /**
   * Handle drag start event
   * @param {Object} evt - Sortable event
   * @param {string} status - Task status
   */
  onDragStart(evt, status) {
    const taskElement = evt.item;
    const taskId = parseInt(taskElement.dataset.taskId);

    // Add dragging class
    taskElement.classList.add("dragging");

    // Store original position
    taskElement.dataset.originalStatus = status;
    taskElement.dataset.originalIndex = evt.oldIndex;

    // Add visual feedback
    this.addDragFeedback(taskElement);

    console.log(`Started dragging task ${taskId} from ${status}`);
  }

  /**
   * Handle drag end event
   * @param {Object} evt - Sortable event
   * @param {string} status - Task status
   */
  onDragEnd(evt, status) {
    const taskElement = evt.item;
    const taskId = parseInt(taskElement.dataset.taskId);

    // Remove dragging class
    taskElement.classList.remove("dragging");

    // Remove visual feedback
    this.removeDragFeedback(taskElement);

    // Clean up data attributes
    delete taskElement.dataset.originalStatus;
    delete taskElement.dataset.originalIndex;

    console.log(`Finished dragging task ${taskId} to ${status}`);
  }

  /**
   * Handle task added to list
   * @param {Object} evt - Sortable event
   * @param {string} status - Task status
   */
  onTaskAdded(evt, status) {
    const taskElement = evt.item;
    const taskId = parseInt(taskElement.dataset.taskId);
    const newIndex = evt.newIndex;

    // Update task status and position
    if (this.app) {
      this.app.moveTask(taskId, status, newIndex);
    }

    // Add animation
    this.animateTaskAdded(taskElement);

    console.log(`Task ${taskId} added to ${status} at position ${newIndex}`);
  }

  /**
   * Handle task removed from list
   * @param {Object} evt - Sortable event
   * @param {string} status - Task status
   */
  onTaskRemoved(evt, status) {
    const taskElement = evt.item;
    const taskId = parseInt(taskElement.dataset.taskId);

    console.log(`Task ${taskId} removed from ${status}`);
  }

  /**
   * Handle task moved within list
   * @param {Object} evt - Sortable event
   * @param {string} status - Task status
   */
  onTaskMoved(evt, status) {
    const taskElement = evt.item;
    const taskId = parseInt(taskElement.dataset.taskId);
    const newIndex = evt.newIndex;

    // Update task position
    if (this.app) {
      this.app.moveTask(taskId, status, newIndex);
    }

    console.log(`Task ${taskId} moved to position ${newIndex} in ${status}`);
  }

  /**
   * Add visual feedback during drag
   * @param {HTMLElement} element - Task element
   */
  addDragFeedback(element) {
    // Add drop zones highlighting
    const dropZones = document.querySelectorAll(".task-list");
    dropZones.forEach((zone) => {
      zone.classList.add("drop-zone-active");
    });

    // Add drag preview styling
    element.style.transform = "rotate(5deg)";
    element.style.opacity = "0.8";
  }

  /**
   * Remove visual feedback after drag
   * @param {HTMLElement} element - Task element
   */
  removeDragFeedback(element) {
    // Remove drop zones highlighting
    const dropZones = document.querySelectorAll(".task-list");
    dropZones.forEach((zone) => {
      zone.classList.remove("drop-zone-active");
    });

    // Reset drag preview styling
    element.style.transform = "";
    element.style.opacity = "";
  }

  /**
   * Animate task addition
   * @param {HTMLElement} element - Task element
   */
  animateTaskAdded(element) {
    element.classList.add("fade-in");

    setTimeout(() => {
      element.classList.remove("fade-in");
    }, 300);
  }

  /**
   * Enable drag and drop for a specific list
   * @param {string} listId - List ID
   */
  enableDragDrop(listId) {
    const instance = this.sortableInstances[listId];
    if (instance) {
      instance.option("disabled", false);
    }
  }

  /**
   * Disable drag and drop for a specific list
   * @param {string} listId - List ID
   */
  disableDragDrop(listId) {
    const instance = this.sortableInstances[listId];
    if (instance) {
      instance.option("disabled", true);
    }
  }

  /**
   * Enable/disable all drag and drop
   * @param {boolean} enabled - Whether to enable drag and drop
   */
  setDragDropEnabled(enabled) {
    Object.keys(this.sortableInstances).forEach((listId) => {
      const instance = this.sortableInstances[listId];
      if (instance) {
        instance.option("disabled", !enabled);
      }
    });
  }

  /**
   * Refresh sortable instances (useful after DOM updates)
   */
  refreshSortableInstances() {
    // Destroy existing instances
    Object.values(this.sortableInstances).forEach((instance) => {
      instance.destroy();
    });

    // Clear instances
    this.sortableInstances = {};

    // Reinitialize
    this.initSortableLists();
  }

  /**
   * Get sortable instance for a list
   * @param {string} listId - List ID
   * @returns {Object|null} Sortable instance
   */
  getSortableInstance(listId) {
    return this.sortableInstances[listId] || null;
  }

  /**
   * Move task programmatically
   * @param {number} taskId - Task ID
   * @param {string} targetStatus - Target status
   * @param {number} targetIndex - Target index
   */
  moveTaskProgrammatically(taskId, targetStatus, targetIndex) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const targetList = document.getElementById(`${targetStatus}TasksList`);

    if (taskElement && targetList) {
      // Remove from current position
      taskElement.remove();

      // Insert at target position
      const targetElements = targetList.querySelectorAll(".task-item");
      if (targetIndex < targetElements.length) {
        targetList.insertBefore(taskElement, targetElements[targetIndex]);
      } else {
        targetList.appendChild(taskElement);
      }

      // Animate the move
      this.animateTaskAdded(taskElement);
    }
  }

  /**
   * Handle touch events for mobile devices
   */
  initTouchSupport() {
    // Add touch event listeners for better mobile support
    document.addEventListener("touchstart", (e) => {
      const dragHandle = e.target.closest(".drag-handle");
      if (dragHandle) {
        dragHandle.style.cursor = "grabbing";
      }
    });

    document.addEventListener("touchend", (e) => {
      const dragHandle = e.target.closest(".drag-handle");
      if (dragHandle) {
        dragHandle.style.cursor = "grab";
      }
    });
  }

  /**
   * Destroy all sortable instances
   */
  destroy() {
    Object.values(this.sortableInstances).forEach((instance) => {
      instance.destroy();
    });
    this.sortableInstances = {};
  }
}
