class TodoApp {
    constructor() {

        this.data = [
            { id: 1, text: "Drink 8 glasses of water", completed: true },
            { id: 2, text: "Backup project files", completed: true },
            { id: 3, text: "Buy groceries for the week", completed: false },
            { id: 4, text: "30-minute evening run", completed: false }
        ];
        this.currentFilter = 'all';
        this.inputElement = document.getElementById('todo-input');
        this.listElement = document.getElementById('todo-list');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.init();
    }

    init() {
        this.setupFilterEvents();
        this.setupInputEvent();
        this.render();
    }

    setupFilterEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filterType = button.innerText.toLowerCase();
                this.currentFilter = filterType;
                this.render();
            });
        });
    }

    setupInputEvent() {
        if (this.inputElement) {
            this.inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.inputElement.value.trim() !== "") {
                    this.data.push({
                        id: Date.now(),
                        text: this.inputElement.value.trim(),
                        completed: false
                    });
                    this.inputElement.value = "";
                    this.render();
                }
            });
        }
    }

    toggleTodo(id) {
        this.data = this.data.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
        this.render();
    }
    
    deleteTodo(id, event) {
        
        event.stopPropagation(); 
    
        this.data = this.data.filter(item => item.id !== id);
        this.render();
    }

    render() {
        this.listElement.innerHTML = "";
        
        const filtered = this.data.filter(item => {
            if (this.currentFilter === 'active') return !item.completed;
            if (this.currentFilter === 'completed') return item.completed;
            return true;
        });

        filtered.forEach(item => {
            const li = document.createElement('li');
            li.className = `todo-item ${item.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div style="display: flex; align-items: center; flex: 1;">
                    <div class="${item.completed ? 'check-icon' : 'check-icon-empty'}">
                        ${item.completed ? '<i class="fa-solid fa-circle-check"></i>' : ''}
                    </div>
                    <span class="task-text">${item.text}</span>
                </div>
                <button class="todo-delete-btn" title="Delete Task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            
            li.addEventListener('click', () => this.toggleTodo(item.id));
            
            li.querySelector('.todo-delete-btn').addEventListener('click', (e) => this.deleteTodo(item.id, e));
            
            this.listElement.appendChild(li);
        });

        const countElement = document.getElementById('task-count');
        if (countElement) {
            countElement.innerText = `${this.data.length} task${this.data.length !== 1 ? 's' : ''}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
