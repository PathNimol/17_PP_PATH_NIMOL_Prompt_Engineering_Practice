/**
 * StorageManager - Handles localStorage operations and data persistence
 */

export class StorageManager {
  constructor() {
    this.storageKey = "todo-app-data";
    this.settingsKey = "todo-app-settings";
    this.historyKey = "todo-app-history";
    this.maxHistoryEntries = 100;
  }

  /**
   * Initialize storage manager
   */
  async init() {
    try {
      // Check if localStorage is available
      if (!this.isLocalStorageAvailable()) {
        console.warn("localStorage is not available. Data will not persist.");
        return;
      }

      // Initialize with default data if needed
      if (!this.getTasks().length && !this.getSettings()) {
        this.initializeDefaultData();
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  isLocalStorageAvailable() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Initialize default data
   */
  initializeDefaultData() {
    const defaultSettings = {
      theme: "light",
      sidebarCollapsed: false,
      defaultTaskStatus: "active",
      showCompletedTasks: true,
      sortBy: "createdAt",
      sortDirection: "desc",
    };

    this.saveSettings(defaultSettings);
  }

  /**
   * Save tasks to localStorage
   * @param {Array} tasks - Array of task objects
   */
  saveTasks(tasks) {
    try {
      const data = {
        tasks: tasks,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save tasks:", error);
      throw new Error("Failed to save tasks to storage");
    }
  }

  /**
   * Get tasks from localStorage
   * @returns {Array} Array of task objects
   */
  getTasks() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return parsed.tasks || [];
    } catch (error) {
      console.error("Failed to get tasks:", error);
      return [];
    }
  }

  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings object
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  /**
   * Get settings from localStorage
   * @returns {Object} Settings object
   */
  getSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get settings:", error);
      return {};
    }
  }

  /**
   * Save a specific setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  saveSetting(key, value) {
    try {
      const settings = this.getSettings();
      settings[key] = value;
      this.saveSettings(settings);
    } catch (error) {
      console.error("Failed to save setting:", error);
    }
  }

  /**
   * Get a specific setting
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if setting doesn't exist
   * @returns {*} Setting value
   */
  getSetting(key, defaultValue = null) {
    try {
      const settings = this.getSettings();
      return settings.hasOwnProperty(key) ? settings[key] : defaultValue;
    } catch (error) {
      console.error("Failed to get setting:", error);
      return defaultValue;
    }
  }

  /**
   * Add entry to history
   * @param {string} action - Action performed
   * @param {string} details - Action details
   * @param {Object} task - Task object (optional)
   */
  addHistoryEntry(action, details, task = null) {
    try {
      const history = this.getHistory();
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        taskId: task ? task.id : null,
        taskTitle: task ? task.title : null,
      };

      history.unshift(entry);

      // Keep only the most recent entries
      if (history.length > this.maxHistoryEntries) {
        history.splice(this.maxHistoryEntries);
      }

      localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to add history entry:", error);
    }
  }

  /**
   * Get history entries
   * @returns {Array} Array of history entries
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.historyKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get history:", error);
      return [];
    }
  }

  /**
   * Clear history
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.historyKey);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }

  /**
   * Export all data
   * @returns {Object} Exported data object
   */
  exportData() {
    try {
      return {
        tasks: this.getTasks(),
        settings: this.getSettings(),
        history: this.getHistory(),
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };
    } catch (error) {
      console.error("Failed to export data:", error);
      throw new Error("Failed to export data");
    }
  }

  /**
   * Import data
   * @param {Object} data - Data object to import
   * @param {boolean} merge - Whether to merge with existing data
   */
  importData(data, merge = false) {
    try {
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data format");
      }

      if (data.tasks && Array.isArray(data.tasks)) {
        if (merge) {
          const existingTasks = this.getTasks();
          const mergedTasks = [...existingTasks, ...data.tasks];
          this.saveTasks(mergedTasks);
        } else {
          this.saveTasks(data.tasks);
        }
      }

      if (data.settings && typeof data.settings === "object") {
        if (merge) {
          const existingSettings = this.getSettings();
          const mergedSettings = { ...existingSettings, ...data.settings };
          this.saveSettings(mergedSettings);
        } else {
          this.saveSettings(data.settings);
        }
      }

      if (data.history && Array.isArray(data.history)) {
        if (merge) {
          const existingHistory = this.getHistory();
          const mergedHistory = [...existingHistory, ...data.history];
          localStorage.setItem(this.historyKey, JSON.stringify(mergedHistory));
        } else {
          localStorage.setItem(this.historyKey, JSON.stringify(data.history));
        }
      }

      this.addHistoryEntry(
        "Data Import",
        `Imported data from ${data.exportDate || "unknown date"}`
      );
    } catch (error) {
      console.error("Failed to import data:", error);
      throw new Error("Failed to import data");
    }
  }

  /**
   * Clear all data
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.settingsKey);
      localStorage.removeItem(this.historyKey);
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage info
   */
  getStorageInfo() {
    try {
      const tasks = this.getTasks();
      const settings = this.getSettings();
      const history = this.getHistory();

      const tasksSize = JSON.stringify(tasks).length;
      const settingsSize = JSON.stringify(settings).length;
      const historySize = JSON.stringify(history).length;
      const totalSize = tasksSize + settingsSize + historySize;

      return {
        tasksCount: tasks.length,
        tasksSize: tasksSize,
        settingsSize: settingsSize,
        historyCount: history.length,
        historySize: historySize,
        totalSize: totalSize,
        totalSizeKB: Math.round((totalSize / 1024) * 100) / 100,
      };
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return null;
    }
  }

  /**
   * Backup data to downloadable file
   * @param {string} filename - Filename for backup
   */
  createBackup(filename = null) {
    try {
      const data = this.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download =
        filename ||
        `todo-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      this.addHistoryEntry(
        "Backup Created",
        `Created backup: ${link.download}`
      );
    } catch (error) {
      console.error("Failed to create backup:", error);
      throw new Error("Failed to create backup");
    }
  }

  /**
   * Restore data from file
   * @param {File} file - File to restore from
   * @param {boolean} merge - Whether to merge with existing data
   */
  async restoreFromFile(file, merge = false) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      this.importData(data, merge);
      this.addHistoryEntry("Data Restored", `Restored data from: ${file.name}`);
    } catch (error) {
      console.error("Failed to restore from file:", error);
      throw new Error("Failed to restore data from file");
    }
  }
}
