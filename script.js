// Get DOM elements
const todoInput = document.getElementById('todoInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const sortByDateBtn = document.getElementById('sortByDateBtn');

// Load todos from localStorage on page load
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let sortByDate = false;

// Initialize the app
displayTodos();
updateStats();

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});
sortByDateBtn.addEventListener('click', toggleSortByDate);

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const dueDate = dueDateInput.value || null;

    const todo = {
        id: Date.now(),
        text: text,
        dueDate: dueDate,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    displayTodos();
    updateStats();
    todoInput.value = '';
    dueDateInput.value = '';
    todoInput.focus();
}

// Display all todos
function displayTodos() {
    todoList.innerHTML = '';

    // Sort todos if enabled
    let displayTodos = [...todos];
    if (sortByDate) {
        displayTodos.sort((a, b) => {
            // Todos without dates go to the bottom
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    displayTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');

        const dueDateElement = getDueDateElement(todo.dueDate);

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dueDateElement}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;

        todoList.appendChild(li);
    });
}

// Get formatted due date element
function getDueDateElement(dueDate) {
    if (!dueDate) {
        return '<span class="due-date no-date">No due date</span>';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let className = 'due-date';
    let text = '';

    if (diffDays < 0) {
        className += ' overdue';
        text = `Overdue: ${formatDate(dueDate)}`;
    } else if (diffDays === 0) {
        className += ' due-soon';
        text = 'Due Today';
    } else if (diffDays === 1) {
        className += ' due-soon';
        text = 'Due Tomorrow';
    } else if (diffDays <= 7) {
        className += ' due-soon';
        text = `Due in ${diffDays} days`;
    } else {
        className += ' due-later';
        text = formatDate(dueDate);
    }

    return `<span class="${className}">${text}</span>`;
}

// Format date to readable format
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

// Toggle sort by date
function toggleSortByDate() {
    sortByDate = !sortByDate;
    sortByDateBtn.classList.toggle('active', sortByDate);
    displayTodos();
}

// Toggle todo completion status
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        displayTodos();
        updateStats();
    }
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    displayTodos();
    updateStats();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
