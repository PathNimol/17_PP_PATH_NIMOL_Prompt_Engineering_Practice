/**
 * Modern To-Do List Application
 * Main application entry point
 */

import { TaskManager } from "./modules/TaskManager.js";
import { UIManager } from "./modules/UIManager.js";
import { StorageManager } from "./modules/StorageManager.js";
import { ToastManager } from "./modules/ToastManager.js";
import { DragDropManager } from "./modules/DragDropManager.js";
import { KeyboardManager } from "./modules/KeyboardManager.js";
import { sampleData } from "./data/sampleData.js";

class ToDoApp {
  constructor() {
    this.taskManager = new TaskManager();
    this.uiManager = new UIManager();
    this.storageManager = new StorageManager();
    this.toastManager = new ToastManager();
    this.dragDropManager = new DragDropManager();
    this.keyboardManager = new KeyboardManager();

    this.currentFilter = "all";
    this.currentSearch = "";
    this.editingTaskId = null;

    this.init();
  }

  async init() {
    try {
      // Initialize storage and load data
      await this.storageManager.init();
      const savedTasks = this.storageManager.getTasks();

      if (savedTasks.length === 0) {
        // Load sample data if no saved tasks
        this.taskManager.loadTasks(sampleData);
        this.storageManager.saveTasks(this.taskManager.getTasks());
      } else {
        this.taskManager.loadTasks(savedTasks);
      }

      // Initialize UI
      this.uiManager.init();

      // Initialize drag & drop
      this.dragDropManager.init(this);

      // Initialize keyboard shortcuts
      this.keyboardManager.init(this);

      // Set up event listeners
      this.setupEventListeners();

      // Initialize dark mode
      this.initDarkMode();

      // Render initial state
      this.render();

      console.log("To-Do App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.toastManager.show("Failed to initialize application", "error");
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll("[data-section]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        this.showSection(section);
      });
    });

    // Sidebar toggle for mobile
    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("show");
    });

    document
      .getElementById("mobileSidebarToggle")
      ?.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("show");
      });

    // Add task button
    document.getElementById("addTaskBtn").addEventListener("click", () => {
      this.showAddTaskModal();
    });

    // Task form submission
    document.getElementById("taskForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleTaskSubmit();
    });

    // Filter controls
    document.querySelectorAll('input[name="filterStatus"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.currentFilter = e.target.value;
        this.render();
      });
    });

    // Search input
    document.getElementById("searchTasks").addEventListener("input", (e) => {
      this.currentSearch = e.target.value.toLowerCase();
      this.render();
    });

    // Dark mode toggle
    document
      .getElementById("darkModeToggle")
      .addEventListener("change", (e) => {
        this.toggleDarkMode(e.target.checked);
      });

    // Export/Import
    document.getElementById("exportTasks").addEventListener("click", () => {
      this.exportTasks();
    });

    document.getElementById("importTasks").addEventListener("click", () => {
      document.getElementById("importFileInput").click();
    });

    document
      .getElementById("importFileInput")
      .addEventListener("change", (e) => {
        this.importTasks(e.target.files[0]);
      });

    document.getElementById("clearAllTasks").addEventListener("click", () => {
      this.clearAllTasks();
    });

    // Edit task from details modal
    document
      .getElementById("editTaskFromDetails")
      .addEventListener("click", () => {
        this.editTaskFromDetails();
      });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("sidebar");
      const mobileToggle = document.getElementById("mobileSidebarToggle");

      if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !mobileToggle.contains(e.target) &&
        sidebar.classList.contains("show")
      ) {
        sidebar.classList.remove("show");
      }
    });
  }

  initDarkMode() {
    const savedTheme = this.storageManager.getSetting("theme", "light");
    const isDark = savedTheme === "dark";

    document.getElementById("darkModeToggle").checked = isDark;
    this.toggleDarkMode(isDark);
  }

  toggleDarkMode(isDark) {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    this.storageManager.saveSetting("theme", isDark ? "dark" : "light");
  }

  showSection(sectionName) {
    // Update navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${sectionName}"]`)
      .classList.add("active");

    // Update page title
    const titles = {
      dashboard: "Dashboard",
      tasks: "Tasks",
      history: "History",
    };
    document.getElementById("pageTitle").textContent = titles[sectionName];

    // Show/hide sections
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.add("d-none");
    });
    document
      .getElementById(`${sectionName}-section`)
      .classList.remove("d-none");

    // Render section content
    this.render();
  }

  showAddTaskModal() {
    this.editingTaskId = null;
    document.getElementById("taskModalLabel").textContent = "Add New Task";
    document.getElementById("saveTaskBtn").textContent = "Save Task";

    // Reset form
    document.getElementById("taskForm").reset();
    document.getElementById("taskStatus").value = "active";

    // Clear validation
    document.querySelectorAll(".is-invalid").forEach((el) => {
      el.classList.remove("is-invalid");
    });

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("taskModal"));
    modal.show();
  }

  showEditTaskModal(taskId) {
    const task = this.taskManager.getTask(taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    document.getElementById("taskModalLabel").textContent = "Edit Task";
    document.getElementById("saveTaskBtn").textContent = "Update Task";

    // Fill form with task data
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("taskDueDate").value = task.dueDate || "";
    document.getElementById("taskStatus").value = task.status;

    // Clear validation
    document.querySelectorAll(".is-invalid").forEach((el) => {
      el.classList.remove("is-invalid");
    });

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("taskModal"));
    modal.show();
  }

  handleTaskSubmit() {
    const form = document.getElementById("taskForm");
    const formData = new FormData(form);

    const taskData = {
      title:
        formData.get("taskTitle") || document.getElementById("taskTitle").value,
      description:
        formData.get("taskDescription") ||
        document.getElementById("taskDescription").value,
      dueDate:
        formData.get("taskDueDate") ||
        document.getElementById("taskDueDate").value,
      status:
        formData.get("taskStatus") ||
        document.getElementById("taskStatus").value,
    };

    // Validate form
    if (!this.validateTaskForm(taskData)) {
      return;
    }

    try {
      if (this.editingTaskId) {
        // Update existing task
        this.taskManager.updateTask(this.editingTaskId, taskData);
        this.toastManager.show("Task updated successfully!", "success");
      } else {
        // Create new task
        this.taskManager.createTask(taskData);
        this.toastManager.show("Task created successfully!", "success");
      }

      // Save to storage
      this.storageManager.saveTasks(this.taskManager.getTasks());

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("taskModal")
      );
      modal.hide();

      // Render updated UI
      this.render();
    } catch (error) {
      console.error("Error saving task:", error);
      this.toastManager.show("Failed to save task", "error");
    }
  }

  validateTaskForm(taskData) {
    let isValid = true;

    // Validate title
    if (!taskData.title.trim()) {
      this.showFieldError("taskTitle", "Title is required");
      isValid = false;
    } else if (taskData.title.length > 100) {
      this.showFieldError(
        "taskTitle",
        "Title must be less than 100 characters"
      );
      isValid = false;
    }

    // Validate description length
    if (taskData.description && taskData.description.length > 500) {
      this.showFieldError(
        "taskDescription",
        "Description must be less than 500 characters"
      );
      isValid = false;
    }

    // Validate due date
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        this.showFieldError("taskDueDate", "Due date cannot be in the past");
        isValid = false;
      }
    }

    return isValid;
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = field.nextElementSibling;

    field.classList.add("is-invalid");
    feedback.textContent = message;
  }

  deleteTask(taskId) {
    const task = this.taskManager.getTask(taskId);
    if (!task) return;

    // Show confirmation
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskManager.deleteTask(taskId);
      this.storageManager.saveTasks(this.taskManager.getTasks());
      this.render();

      // Show undo toast
      this.toastManager.showWithUndo("Task deleted successfully!", () =>
        this.undoDeleteTask(task)
      );
    }
  }

  undoDeleteTask(task) {
    this.taskManager.createTask(task);
    this.storageManager.saveTasks(this.taskManager.getTasks());
    this.render();
    this.toastManager.show("Task restored!", "success");
  }

  toggleTaskStatus(taskId) {
    const task = this.taskManager.getTask(taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "active" : "completed";
    this.taskManager.updateTask(taskId, { status: newStatus });
    this.storageManager.saveTasks(this.taskManager.getTasks());
    this.render();

    const action = newStatus === "completed" ? "completed" : "reopened";
    this.toastManager.show(`Task ${action}!`, "success");
  }

  showTaskDetails(taskId) {
    const task = this.taskManager.getTask(taskId);
    if (!task) return;

    const content = document.getElementById("taskDetailsContent");
    content.innerHTML = this.uiManager.renderTaskDetails(task);

    const modal = new bootstrap.Modal(
      document.getElementById("taskDetailsModal")
    );
    modal.show();

    // Store task ID for edit functionality
    document.getElementById("editTaskFromDetails").dataset.taskId = taskId;
  }

  editTaskFromDetails() {
    const taskId = document.getElementById("editTaskFromDetails").dataset
      .taskId;
    if (taskId) {
      // Close details modal
      const detailsModal = bootstrap.Modal.getInstance(
        document.getElementById("taskDetailsModal")
      );
      detailsModal.hide();

      // Show edit modal
      this.showEditTaskModal(taskId);
    }
  }

  exportTasks() {
    const tasks = this.taskManager.getTasks();
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `todo-tasks-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    this.toastManager.show("Tasks exported successfully!", "success");
  }

  importTasks(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const tasks = JSON.parse(e.target.result);

        if (Array.isArray(tasks)) {
          // Merge with existing tasks
          const existingTasks = this.taskManager.getTasks();
          const mergedTasks = [...existingTasks, ...tasks];

          this.taskManager.loadTasks(mergedTasks);
          this.storageManager.saveTasks(mergedTasks);
          this.render();

          this.toastManager.show(
            `${tasks.length} tasks imported successfully!`,
            "success"
          );
        } else {
          throw new Error("Invalid file format");
        }
      } catch (error) {
        console.error("Import error:", error);
        this.toastManager.show(
          "Failed to import tasks. Please check the file format.",
          "error"
        );
      }
    };
    reader.readAsText(file);
  }

  clearAllTasks() {
    if (
      confirm(
        "Are you sure you want to clear all tasks? This action cannot be undone."
      )
    ) {
      this.taskManager.clearTasks();
      this.storageManager.saveTasks([]);
      this.render();
      this.toastManager.show("All tasks cleared!", "success");
    }
  }

  render() {
    const tasks = this.taskManager.getTasks();
    const filteredTasks = this.getFilteredTasks(tasks);

    // Update statistics
    this.updateStatistics(tasks);

    // Render current section
    const activeSection =
      document.querySelector(".nav-link.active").dataset.section;

    switch (activeSection) {
      case "dashboard":
        this.renderDashboard(tasks);
        break;
      case "tasks":
        this.renderTasks(filteredTasks);
        break;
      case "history":
        this.renderHistory();
        break;
    }
  }

  getFilteredTasks(tasks) {
    let filtered = tasks;

    // Filter by status
    if (this.currentFilter !== "all") {
      filtered = filtered.filter((task) => task.status === this.currentFilter);
    }

    // Filter by search term
    if (this.currentSearch) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(this.currentSearch) ||
          (task.description &&
            task.description.toLowerCase().includes(this.currentSearch))
      );
    }

    return filtered;
  }

  updateStatistics(tasks) {
    const stats = {
      total: tasks.length,
      active: tasks.filter((t) => t.status === "active").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };

    document.getElementById("totalTasks").textContent = stats.total;
    document.getElementById("activeTasks").textContent = stats.active;
    document.getElementById("inProgressTasks").textContent = stats.inProgress;
    document.getElementById("completedTasks").textContent = stats.completed;

    // Update column counts
    document.getElementById("activeCount").textContent = stats.active;
    document.getElementById("inProgressCount").textContent = stats.inProgress;
    document.getElementById("completedCount").textContent = stats.completed;
  }

  renderDashboard(tasks) {
    // Render recent tasks
    const recentTasks = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const container = document.getElementById("recentTasksList");
    if (recentTasks.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="bi bi-inbox"></i><h5>No tasks yet</h5><p>Create your first task to get started!</p></div>';
    } else {
      container.innerHTML = recentTasks
        .map((task) => this.uiManager.renderTaskCard(task, true))
        .join("");
    }
  }

  renderTasks(tasks) {
    const statusColumns = ["active", "in-progress", "completed"];

    statusColumns.forEach((status) => {
      const container = document.getElementById(`${status}TasksList`);
      const statusTasks = tasks.filter((task) => task.status === status);

      if (statusTasks.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox"></i><h5>No ${status.replace(
          "-",
          " "
        )} tasks</h5><p>Tasks will appear here when created.</p></div>`;
      } else {
        container.innerHTML = statusTasks
          .map((task) => this.uiManager.renderTaskCard(task, false))
          .join("");
      }
    });
  }

  renderHistory() {
    const history = this.storageManager.getHistory();
    const container = document.getElementById("historyList");

    if (history.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="bi bi-clock-history"></i><h5>No history yet</h5><p>Your task activities will appear here.</p></div>';
    } else {
      container.innerHTML = history
        .map((entry) => this.uiManager.renderHistoryItem(entry))
        .join("");
    }
  }

  // Public methods for drag & drop
  moveTask(taskId, newStatus, newIndex) {
    this.taskManager.moveTask(taskId, newStatus, newIndex);
    this.storageManager.saveTasks(this.taskManager.getTasks());
    this.render();
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.todoApp = new ToDoApp();
});
