const API_URL = 'http://localhost:3000/api';

// DOM Elements
const personForm = document.getElementById('personForm');
const taskForm = document.getElementById('taskForm');
const personSelect = document.getElementById('personSelect');
const taskList = document.getElementById('taskList');

// Fetch and load persons
async function loadPersons() {
    const res = await fetch(`${API_URL}/persons`);
    const persons = await res.json();

    personSelect.innerHTML = '<option value="" disabled selected>Select a person</option>';
    persons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name;
        personSelect.appendChild(option);
    });
}

// Fetch and load tasks (UPDATED WITH DELETE BUTTON)
async function loadTasks() {
    const res = await fetch(`${API_URL}/tasks`);
    const tasks = await res.json();

    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task.description}</span> 
            <div class="task-actions">
                <span class="task-owner">👤 ${task.person_name}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// NEW: Delete Task function
window.deleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
    });

    loadTasks(); // Refresh the list after deletion
};

// Event: Add Person
personForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('personName').value;

    await fetch(`${API_URL}/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    document.getElementById('personName').value = '';
    loadPersons();
});

// Event: Add Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('taskDesc').value;
    const person_id = document.getElementById('personSelect').value;

    await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, person_id })
    });

    document.getElementById('taskDesc').value = '';
    loadTasks();
});

// Initialize page
loadPersons();
loadTasks();