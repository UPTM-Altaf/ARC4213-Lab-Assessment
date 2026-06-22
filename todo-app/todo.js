class Todo {
    constructor({ title = "Todo App", data = [] } = {}) {
        this.title = title;
        
        // Starting with your original 5 tasks represented as JavaScript data objects
        this.data = data.length > 0 ? data : [
            { id: 1, text: "Drink 8 glasses of water", completed: true },
            { id: 2, text: "Backup project files", completed: true },
            { id: 3, text: "Buy groceries for the week", completed: false },
            { id: 4, text: "30-minute evening run", completed: false },
        ];
        
        this.currentFilter = 'all'; // Keeps track of active filter: 'all', 'active', or 'completed'
        
        // Target DOM Elements
        this.inputElement = document.getElementById('todo-input');
        this.listElement = document.getElementById('todo-list');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        this.init();
    }

    init() {
        this.setTodayDate();
        this.render(); // Draw initial tasks
        this.setupFilterEvents();
        
        // Listen for new item creation
        if (this.inputElement) {
            this.inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.inputElement.value.trim() !== "") {
                    this.addTodo(this.inputElement.value.trim());
                    this.inputElement.value = "";
                }
            });
        }
    }

    setTodayDate() {
        const dateElement = document.getElementById('todo-date');
        if (dateElement) {
            const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            const today = new Date();
            dateElement.innerText = today.toLocaleDateString('en-US', options).replace(/,/g, '');
        }
    }

    // Bind click events to the filter buttons
    setupFilterEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active styling from all buttons
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active styling to clicked button
                button.classList.add('active');
                
                // Set current filter based on button text
                const filterText = button.innerText.toLowerCase();
                this.currentFilter = filterText;
                
                // Re-render list based on new filter rules
                this.render();
            });
        });
    }

    addTodo(text) {
        const newItem = {
            id: Date.now(),
            text: text,
            completed: false
        };
        this.data.push(newItem);
        this.render();
    }

    toggleTodo(id) {
        this.data = this.data.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        this.render();
    }

    // Core method that filters data and renders items to screen
    render() {
        // 1. Clear the UI list container completely
        this.listElement.innerHTML = "";

        // 2. Filter data array based on selected filter
        const filteredData = this.data.filter(item => {
            if (this.currentFilter === 'active') return !item.completed;
            if (this.currentFilter === 'completed') return item.completed;
            return true; // 'all' filter
        });

        // 3. Generate HTML dynamically for remaining items
        filteredData.forEach(item => {
            const li = document.createElement('li');
            li.className = `todo-item ${item.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="${item.completed ? 'check-icon' : 'check-icon-empty'}">
                    ${item.completed ? '<i class="fa-solid fa-circle-check"></i>' : ''}
                </div>
                <span class="task-text">${item.text}</span>
            `;
            
            // Toggle task state when row is clicked
            li.addEventListener('click', () => this.toggleTodo(item.id));
            
            this.listElement.appendChild(li);
        });

        this.updateTaskCount();
    }

    updateTaskCount() {
        const countElement = document.getElementById('task-count');
        if (countElement) {
            const total = this.data.length;
            countElement.innerText = `${total} task${total !== 1 ? 's' : ''}`;
        }
    }
}

// Instantiate the App
document.addEventListener('DOMContentLoaded', () => {
    const todoApp = new Todo();
});