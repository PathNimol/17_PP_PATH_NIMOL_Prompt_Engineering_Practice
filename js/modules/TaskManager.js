/**
 * TaskManager - Handles task data operations
 */

export class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  /**
   * Load tasks from data
   * @param {Array} tasksData - Array of task objects
   */
  loadTasks(tasksData) {
    this.tasks = tasksData.map((task) => this.normalizeTask(task));
    this.nextId = Math.max(...this.tasks.map((t) => t.id), 0) + 1;
  }

  /**
   * Normalize task object to ensure all required fields are present
   * @param {Object} task - Task object
   * @returns {Object} Normalized task object
   */
  normalizeTask(task) {
    return {
      id: task.id || this.nextId++,
      title: task.title || "",
      description: task.description || "",
      status: task.status || "active",
      dueDate: task.dueDate || null,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      completedAt: task.completedAt || null,
    };
  }

  /**
   * Get all tasks
   * @returns {Array} Array of all tasks
   */
  getTasks() {
    return [...this.tasks];
  }

  /**
   * Get task by ID
   * @param {number} id - Task ID
   * @returns {Object|null} Task object or null if not found
   */
  getTask(id) {
    return this.tasks.find((task) => task.id === id) || null;
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Object} Created task object
   */
  createTask(taskData) {
    const task = this.normalizeTask({
      ...taskData,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Set completedAt if status is completed
    if (task.status === "completed") {
      task.completedAt = new Date().toISOString();
    }

    this.tasks.push(task);
    return task;
  }

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated task object or null if not found
   */
  updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return null;

    const task = this.tasks[taskIndex];
    const updatedTask = {
      ...task,
      ...updates,
      id: task.id, // Preserve ID
      createdAt: task.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    // Update completedAt based on status
    if (updates.status === "completed" && task.status !== "completed") {
      updatedTask.completedAt = new Date().toISOString();
    } else if (updates.status !== "completed" && task.status === "completed") {
      updatedTask.completedAt = null;
    }

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {boolean} True if task was deleted, false if not found
   */
  deleteTask(id) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return false;

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  /**
   * Move task to different status and position
   * @param {number} id - Task ID
   * @param {string} newStatus - New status
   * @param {number} newIndex - New position within the status
   */
  moveTask(id, newStatus, newIndex) {
    const task = this.getTask(id);
    if (!task) return;

    // Remove from current position
    this.tasks = this.tasks.filter((t) => t.id !== id);

    // Update task status and completion date
    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === "completed" && task.status !== "completed") {
      updatedTask.completedAt = new Date().toISOString();
    } else if (newStatus !== "completed" && task.status === "completed") {
      updatedTask.completedAt = null;
    }

    // Insert at new position
    const tasksInStatus = this.tasks.filter((t) => t.status === newStatus);
    const insertIndex = Math.min(newIndex, tasksInStatus.length);

    // Find the actual index in the main array
    let actualIndex = 0;
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].status === newStatus) {
        if (actualIndex === insertIndex) {
          this.tasks.splice(i, 0, updatedTask);
          return;
        }
        actualIndex++;
      }
    }

    // If we reach here, append to end
    this.tasks.push(updatedTask);
  }

  /**
   * Clear all tasks
   */
  clearTasks() {
    this.tasks = [];
  }

  /**
   * Get tasks by status
   * @param {string} status - Task status
   * @returns {Array} Array of tasks with the specified status
   */
  getTasksByStatus(status) {
    return this.tasks.filter((task) => task.status === status);
  }

  /**
   * Get overdue tasks
   * @returns {Array} Array of overdue tasks
   */
  getOverdueTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
  }

  /**
   * Get tasks due today
   * @returns {Array} Array of tasks due today
   */
  getTasksDueToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate < tomorrow;
    });
  }

  /**
   * Get task statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const total = this.tasks.length;
    const active = this.getTasksByStatus("active").length;
    const inProgress = this.getTasksByStatus("in-progress").length;
    const completed = this.getTasksByStatus("completed").length;
    const overdue = this.getOverdueTasks().length;
    const dueToday = this.getTasksDueToday().length;

    return {
      total,
      active,
      inProgress,
      completed,
      overdue,
      dueToday,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Search tasks by query
   * @param {string} query - Search query
   * @returns {Array} Array of matching tasks
   */
  searchTasks(query) {
    if (!query.trim()) return this.tasks;

    const lowercaseQuery = query.toLowerCase();
    return this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        (task.description &&
          task.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Sort tasks by criteria
   * @param {Array} tasks - Tasks to sort
   * @param {string} criteria - Sort criteria (title, dueDate, createdAt, priority)
   * @param {string} direction - Sort direction (asc, desc)
   * @returns {Array} Sorted tasks
   */
  sortTasks(tasks, criteria = "createdAt", direction = "desc") {
    return [...tasks].sort((a, b) => {
      let aValue, bValue;

      switch (criteria) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
          bValue = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
}
