// Productivity Garden App - JavaScript
class ProductivityGarden {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('productivityTasks')) || [];
        this.plants = JSON.parse(localStorage.getItem('productivityPlants')) || [];
        this.stats = JSON.parse(localStorage.getItem('productivityStats')) || {
            completedTasks: 0,
            plantsGrown: 0
        };
        
        this.plantTypes = {
            work: ['🏢', '💼', '📊', '💻', '📈', '🏗️', '⚙️', '📋'],
            personal: ['🏠', '🛋️', '🧹', '🍳', '📱', '🎯', '🔧', '📦'],
            health: ['💪', '🏃‍♂️', '🥗', '🧘‍♀️', '🚴‍♂️', '🏋️‍♂️', '🥤', '😴'],
            learning: ['📚', '🎓', '🧠', '📝', '🔬', '🎯', '💡', '📖'],
            creative: ['🎨', '🎭', '🎵', '✍️', '📸', '🎪', '🎬', '🖌️']
        };

        this.achievements = [
            { id: 'first_task', title: 'First Sprout!', description: 'Complete your first task', threshold: 1 },
            { id: 'five_tasks', title: 'Growing Garden', description: 'Complete 5 tasks', threshold: 5 },
            { id: 'ten_tasks', title: 'Blooming Beautiful', description: 'Complete 10 tasks', threshold: 10 },
            { id: 'twenty_tasks', title: 'Garden Master', description: 'Complete 20 tasks', threshold: 20 },
            { id: 'fifty_tasks', title: 'Productivity Guru', description: 'Complete 50 tasks', threshold: 50 }
        ];

        this.unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.renderGarden();
        this.updateStats();
        this.showWelcomeMessage();
    }

    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.toggleAddTaskForm();
        });

        // Save task button
        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        // Cancel task button
        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.toggleAddTaskForm();
        });

        // Task input enter key
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveTask();
            }
        });

        // Reset garden button
        document.getElementById('resetGardenBtn').addEventListener('click', () => {
            this.resetGarden();
        });

        // Achievement modal close
        document.getElementById('closeAchievementBtn').addEventListener('click', () => {
            this.closeAchievementModal();
        });

        // Click outside modal to close
        document.getElementById('achievementModal').addEventListener('click', (e) => {
            if (e.target.id === 'achievementModal') {
                this.closeAchievementModal();
            }
        });
    }

    toggleAddTaskForm() {
        const form = document.getElementById('addTaskForm');
        const isVisible = form.style.display !== 'none';
        
        if (isVisible) {
            form.style.display = 'none';
            this.clearTaskForm();
        } else {
            form.style.display = 'block';
            document.getElementById('taskInput').focus();
        }
    }

    clearTaskForm() {
        document.getElementById('taskInput').value = '';
        document.getElementById('taskType').value = 'work';
        document.getElementById('taskPriority').value = 'medium';
    }

    saveTask() {
        const taskInput = document.getElementById('taskInput');
        const taskType = document.getElementById('taskType').value;
        const taskPriority = document.getElementById('taskPriority').value;
        
        const taskText = taskInput.value.trim();
        
        if (!taskText) {
            this.showNotification('Please enter a task description!', 'error');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            type: taskType,
            priority: taskPriority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.toggleAddTaskForm();
        this.showNotification('Task planted successfully! 🌱', 'success');
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            
            this.stats.completedTasks++;
            this.growPlant(task);
            this.saveTasks();
            this.saveStats();
            this.renderTasks();
            this.renderGarden();
            this.updateStats();
            this.checkAchievements();
            
            this.showNotification(`Great job! Your ${task.type} plant is growing! 🌿`, 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Task removed from garden', 'info');
        }
    }

    growPlant(task) {
        const plantEmojis = this.plantTypes[task.type];
        const randomPlant = plantEmojis[Math.floor(Math.random() * plantEmojis.length)];
        
        // Priority affects plant size/rarity
        let plantSize = 'normal';
        if (task.priority === 'high') {
            plantSize = 'large';
        } else if (task.priority === 'low') {
            plantSize = 'small';
        }

        const newPlant = {
            id: Date.now(),
            emoji: randomPlant,
            type: task.type,
            size: plantSize,
            taskText: task.text,
            grownAt: new Date().toISOString()
        };

        this.plants.push(newPlant);
        this.stats.plantsGrown++;
        this.savePlants();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.tasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        taskList.style.display = 'block';
        emptyState.style.display = 'none';

        // Sort tasks: incomplete first, then by priority, then by creation date
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        taskList.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <div>
                        <span class="task-type ${task.type}">${this.getTaskTypeIcon(task.type)} ${task.type}</span>
                        <span class="task-priority ${task.priority}">${this.getPriorityIcon(task.priority)} ${task.priority}</span>
                    </div>
                </div>
                <div class="task-content ${task.completed ? 'completed' : ''}">
                    ${task.text}
                </div>
                <div class="task-actions">
                    ${!task.completed ? `
                        <button class="btn btn-success btn-small" onclick="garden.completeTask(${task.id})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                    ` : `
                        <span class="completed-badge">
                            <i class="fas fa-check-circle"></i> Completed
                        </span>
                    `}
                    <button class="btn btn-danger btn-small" onclick="garden.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderGarden() {
        const plantsContainer = document.getElementById('plantsContainer');
        const gardenEmpty = document.getElementById('gardenEmpty');
        
        if (this.plants.length === 0) {
            gardenEmpty.style.display = 'block';
            return;
        }

        gardenEmpty.style.display = 'none';
        
        // Clear existing plants except the empty message
        const existingPlants = plantsContainer.querySelectorAll('.plant');
        existingPlants.forEach(plant => plant.remove());

        // Add plants with staggered animation
        this.plants.forEach((plant, index) => {
            setTimeout(() => {
                const plantElement = document.createElement('div');
                plantElement.className = 'plant';
                plantElement.innerHTML = plant.emoji;
                plantElement.title = `${plant.taskText} (${plant.type} - ${plant.size})`;
                
                // Apply size based on priority
                if (plant.size === 'large') {
                    plantElement.style.fontSize = '3rem';
                } else if (plant.size === 'small') {
                    plantElement.style.fontSize = '2rem';
                }

                // Add click event for plant details
                plantElement.addEventListener('click', () => {
                    this.showPlantDetails(plant);
                });

                plantsContainer.appendChild(plantElement);
            }, index * 200);
        });
    }

    showPlantDetails(plant) {
        const formattedDate = new Date(plant.grownAt).toLocaleDateString();
        this.showNotification(
            `🌱 ${plant.emoji} grown from: "${plant.taskText}" on ${formattedDate}`,
            'info',
            5000
        );
    }

    updateStats() {
        document.getElementById('completedTasks').textContent = this.stats.completedTasks;
        document.getElementById('plantsGrown').textContent = this.stats.plantsGrown;
    }

    checkAchievements() {
        const newAchievements = this.achievements.filter(achievement => 
            this.stats.completedTasks >= achievement.threshold && 
            !this.unlockedAchievements.includes(achievement.id)
        );

        if (newAchievements.length > 0) {
            const achievement = newAchievements[0];
            this.unlockedAchievements.push(achievement.id);
            this.saveAchievements();
            this.showAchievement(achievement);
        }
    }

    showAchievement(achievement) {
        document.getElementById('achievementTitle').textContent = achievement.title;
        document.getElementById('achievementDescription').textContent = achievement.description;
        document.getElementById('achievementModal').style.display = 'block';
    }

    closeAchievementModal() {
        document.getElementById('achievementModal').style.display = 'none';
    }

    resetGarden() {
        if (confirm('Are you sure you want to reset your entire garden? This will delete all tasks and plants.')) {
            this.tasks = [];
            this.plants = [];
            this.stats = { completedTasks: 0, plantsGrown: 0 };
            this.unlockedAchievements = [];
            
            this.saveTasks();
            this.savePlants();
            this.saveStats();
            this.saveAchievements();
            
            this.renderTasks();
            this.renderGarden();
            this.updateStats();
            
            this.showNotification('Garden reset successfully! Start fresh! 🌱', 'info');
        }
    }

    showWelcomeMessage() {
        if (this.tasks.length === 0 && this.plants.length === 0) {
            setTimeout(() => {
                this.showNotification(
                    'Welcome to Productivity Garden! 🌱 Add tasks and watch your garden grow as you complete them!',
                    'info',
                    6000
                );
            }, 1000);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '400px',
            fontSize: '0.9rem',
            fontWeight: '500'
        });

        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #4caf50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #d32f2f)',
            info: 'linear-gradient(135deg, #2196f3, #1976d2)',
            warning: 'linear-gradient(135deg, #ff9800, #f57c00)'
        };
        return colors[type] || colors.info;
    }

    getTaskTypeIcon(type) {
        const icons = {
            work: '🏢',
            personal: '🏠',
            health: '💪',
            learning: '📚',
            creative: '🎨'
        };
        return icons[type] || '📋';
    }

    getPriorityIcon(priority) {
        const icons = {
            low: '🌱',
            medium: '🌿',
            high: '🌳'
        };
        return icons[priority] || '🌿';
    }

    // Local Storage Methods
    saveTasks() {
        localStorage.setItem('productivityTasks', JSON.stringify(this.tasks));
    }

    savePlants() {
        localStorage.setItem('productivityPlants', JSON.stringify(this.plants));
    }

    saveStats() {
        localStorage.setItem('productivityStats', JSON.stringify(this.stats));
    }

    saveAchievements() {
        localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlockedAchievements));
    }
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .completed-badge {
        color: #4caf50;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 5px;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.garden = new ProductivityGarden();
});

// Add some fun easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code for bonus plants
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        if (window.garden) {
            window.garden.showNotification('🎉 Secret garden boost activated! 🌺🌸🌼', 'success');
            // Add some bonus decorative plants
            const bonusPlants = ['🌺', '🌸', '🌼', '🌻', '🌷'];
            bonusPlants.forEach((emoji, index) => {
                setTimeout(() => {
                    const plant = {
                        id: Date.now() + index,
                        emoji: emoji,
                        type: 'bonus',
                        size: 'normal',
                        taskText: 'Secret garden bonus!',
                        grownAt: new Date().toISOString()
                    };
                    window.garden.plants.push(plant);
                    window.garden.savePlants();
                    window.garden.renderGarden();
                }, index * 300);
            });
        }
    }
});
