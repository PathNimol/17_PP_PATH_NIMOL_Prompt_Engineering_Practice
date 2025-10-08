# Modern To-Do List Web App

A modern, responsive, and accessible To-Do List application built with HTML5, vanilla JavaScript (ES6+), and Bootstrap 5. Features drag & drop functionality, dark mode, localStorage persistence, and comprehensive keyboard shortcuts.

## 🚀 Features

### Core Functionality

- ✅ **Add, Edit, Delete Tasks** - Full CRUD operations with validation
- ✅ **Task Status Management** - Active, In Progress, Completed states
- ✅ **Drag & Drop** - Reorder tasks and move between status columns
- ✅ **Search & Filter** - Find tasks by title/description and filter by status
- ✅ **Due Date Support** - Set and track task deadlines with overdue indicators
- ✅ **Task Details** - View comprehensive task information in modal

### User Experience

- 🎨 **Modern Design** - Clean, Gen-Z-friendly aesthetic with custom primary color (#1C7346)
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ⚡ **Smooth Animations** - CSS transitions and micro-interactions
- 🔔 **Toast Notifications** - Success/error messages with undo functionality
- 📊 **Dashboard** - Overview with statistics and recent tasks

### Advanced Features

- 💾 **localStorage Persistence** - Data automatically saved and restored
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation and shortcuts
- ♿ **Accessibility** - ARIA labels, focus management, screen reader support
- 📤 **Export/Import** - Backup and restore tasks as JSON files
- 📝 **Activity History** - Track all task operations
- 🎯 **Empty States** - Helpful messages when lists are empty

## 🛠️ Tech Stack

- **HTML5** - Semantic elements and modern markup
- **CSS3** - Custom properties, animations, responsive design
- **JavaScript ES6+** - Modules, classes, modern syntax
- **Bootstrap 5** - UI framework with custom theming
- **SortableJS** - Drag & drop functionality
- **Bootstrap Icons** - Icon library

## 📁 Project Structure

```
to-do-list/
├── index.html              # Main HTML file
├── styles.css              # Custom CSS with theme variables
├── js/
│   ├── app.js              # Main application entry point
│   ├── modules/
│   │   ├── TaskManager.js  # Task data operations
│   │   ├── UIManager.js    # UI rendering and interactions
│   │   ├── StorageManager.js # localStorage operations
│   │   ├── ToastManager.js # Toast notifications
│   │   ├── DragDropManager.js # Drag & drop functionality
│   │   └── KeyboardManager.js # Keyboard shortcuts & accessibility
│   └── data/
│       └── sampleData.js   # Sample tasks for demo
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or server required - runs entirely in the browser

### Installation

1. **Clone or download** the project files
2. **Open `index.html`** in your web browser
3. **Start using** the application immediately!

### First Use

- The app loads with sample data to demonstrate features
- Create your first task using the "Add Task" button or press `N`
- Explore different sections: Dashboard, Tasks, History
- Try drag & drop to reorder tasks
- Toggle dark mode in the sidebar

## ⌨️ Keyboard Shortcuts

### Navigation

- `N` - Add new task
- `F` - Focus search input
- `D` - Go to Dashboard
- `T` - Go to Tasks
- `H` - Go to History

### Actions

- `Ctrl+S` - Save task (when in modal)
- `Ctrl+E` - Export tasks
- `Ctrl+I` - Import tasks
- `Ctrl+D` - Toggle dark mode
- `Ctrl+/` - Show keyboard shortcuts

### General

- `Esc` - Close modal or clear search
- `Tab` - Navigate between elements
- `Enter` - Activate focused element
- `Space` - Toggle checkboxes/buttons

## 🎨 Customization

### Primary Color

The app uses `#1C7346` as the primary color. To change it:

1. Open `styles.css`
2. Find the `:root` selector
3. Update `--primary-color` variable:

```css
:root {
  --primary-color: #YOUR_COLOR_HERE;
  --primary-hover: #YOUR_DARKER_COLOR_HERE;
}
```

### Adding New Features

The modular architecture makes it easy to extend:

1. **New Modules** - Add files to `js/modules/`
2. **Import in app.js** - Add to the main application
3. **Update UI** - Modify `UIManager.js` for new components
4. **Add Storage** - Extend `StorageManager.js` for persistence

## 🔧 Configuration

### localStorage Settings

The app automatically saves these settings:

- `theme` - Light/dark mode preference
- `sidebarCollapsed` - Sidebar state
- `defaultTaskStatus` - Default status for new tasks
- `showCompletedTasks` - Whether to show completed tasks
- `sortBy` - Default sort criteria
- `sortDirection` - Sort direction

### Data Structure

Tasks are stored with this structure:

```javascript
{
    id: number,
    title: string,
    description: string,
    status: 'active' | 'in-progress' | 'completed',
    dueDate: string | null,
    createdAt: string,
    updatedAt: string,
    completedAt: string | null
}
```

## ♿ Accessibility Features

### Keyboard Navigation

- Full keyboard support for all functions
- Tab navigation with focus indicators
- Arrow key navigation in task lists
- Focus trapping in modals

### Screen Reader Support

- ARIA labels on all interactive elements
- Semantic HTML structure
- Descriptive button labels
- Status announcements

### Visual Accessibility

- High contrast mode support
- Reduced motion support
- Focus indicators
- Color-blind friendly design

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Common Issues

**Tasks not saving:**

- Check if localStorage is enabled in your browser
- Clear browser cache and try again

**Drag & drop not working:**

- Ensure JavaScript is enabled
- Try refreshing the page
- Check browser console for errors

**Dark mode not persisting:**

- Verify localStorage is working
- Check browser privacy settings

**Import/Export not working:**

- Ensure browser allows file downloads
- Check file format (must be valid JSON)

### Performance Tips

- Large task lists (1000+ tasks) may slow down drag & drop
- Clear old history entries periodically
- Export data regularly as backup

## 🔄 Data Management

### Exporting Data

1. Click "Options" → "Export Tasks"
2. File downloads as `todo-tasks-YYYY-MM-DD.json`
3. Contains all tasks, settings, and history

### Importing Data

1. Click "Options" → "Import Tasks"
2. Select JSON file from previous export
3. Data merges with existing tasks

### Backup Strategy

- Export data weekly
- Keep multiple backup files
- Test imports periodically

## 🚀 Future Enhancements

Potential features for future versions:

- Task categories/tags
- Due date reminders
- Task templates
- Team collaboration
- Calendar integration
- Task dependencies
- Time tracking
- Advanced filtering
- Task archiving
- Bulk operations

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all files are properly loaded
4. Try in a different browser

---

**Enjoy organizing your tasks with this modern To-Do List application!** 🎉
