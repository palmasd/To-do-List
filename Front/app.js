document.addEventListener('DOMContentLoaded', () => {
    const yearViewContainer = document.getElementById('year-view'); // This will be removed or repurposed
    const calendarYearHeader = document.getElementById('calendar-year');
    const prevYearBtn = document.getElementById('prev-year-btn');
    const nextYearBtn = document.getElementById('next-year-btn');
    const todayBtn = document.getElementById('today-btn');

    const monthListContainer = document.getElementById('month-list-container');
    const detailedMonthView = document.getElementById('detailed-month-view');

    // Modal elements
    const taskModal = document.getElementById('task-modal');
    const modalDate = document.getElementById('modal-date');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const tasksForDayContainer = document.getElementById('tasks-for-day');

    // Wallpaper elements
    const wallpaperUploadInput = document.getElementById('wallpaper-upload');
    const clearWallpaperBtn = document.getElementById('clear-wallpaper-btn');

    const apiUrl = 'http://localhost:8080/api/tasks';
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // 0-indexed
    let allTasks = [];

    // --- Inicialización ---
    loadWallpaper();
    fetchTasksAndRenderYear();

    // --- Event Listeners para Navegación ---
    prevYearBtn.addEventListener('click', () => {
        currentYear--;
        fetchTasksAndRenderYear();
    });

    nextYearBtn.addEventListener('click', () => {
        currentYear++;
        fetchTasksAndRenderYear();
    });

    todayBtn.addEventListener('click', () => {
        currentYear = new Date().getFullYear();
        currentMonth = new Date().getMonth();
        fetchTasksAndRenderYear();
    });


    // --- Event Listeners para el Modal ---
    closeModalBtn.addEventListener('click', () => {
        taskModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            taskModal.classList.add('hidden');
        }
    });

    saveTaskBtn.addEventListener('click', () => {
        const title = document.getElementById('task-title-input').value.trim();
        const description = document.getElementById('task-desc-input').value.trim();
        const priority = document.getElementById('task-priority-input').value;
        const date = taskModal.dataset.date;

        if (title) {
            addTask({ title, description, priority, date, completed: false });
        }
    });

    // --- Event Listeners para Fondo de Pantalla ---
    wallpaperUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                applyWallpaper(imageUrl);
                localStorage.setItem('customWallpaper', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    clearWallpaperBtn.addEventListener('click', () => {
        applyWallpaper(''); // Elimina el fondo
        localStorage.removeItem('customWallpaper');
    });

    // --- Funciones Principales ---

    function fetchTasksAndRenderYear() {
        calendarYearHeader.textContent = `Calendario ${currentYear}`;
        const yearsToFetch = [currentYear];
        
        Promise.all(yearsToFetch.map(year => 
            fetch(`${apiUrl}?year=${year}`).then(res => res.json())
        )).then(tasksByYear => {
            allTasks = [].concat(...tasksByYear);
            renderMonthList();
            renderDetailedMonth(currentMonth);
        }).catch(error => {
            console.error('Error fetching tasks:', error);
            allTasks = [];
            renderMonthList();
            renderDetailedMonth(currentMonth);
        });
    }

    function renderMonthList() {
        monthListContainer.innerHTML = '';
        for (let month = 0; month < 12; month++) {
            const monthName = new Date(currentYear, month).toLocaleString('es-ES', { month: 'long' });
            const monthListItem = document.createElement('div');
            monthListItem.classList.add('p-2', 'cursor-pointer', 'border-b', 'border-gray-200', 'transition-colors', 'duration-300', 'ease-in-out', 'text-gray-700', 'text-base', 'md:text-base', 'lg:text-lg', 'flex-grow');
            monthListItem.textContent = monthName;
            monthListItem.dataset.month = month;
            if (month === currentMonth) {
                monthListItem.classList.add('shadow-lg', 'bg-blue-100/50');
            } else {
                monthListItem.classList.add('hover:bg-gray-100');
            }
            monthListItem.addEventListener('click', () => {
                currentMonth = month;
                renderDetailedMonth(month);
                renderMonthList(); // Re-renderiza la lista de meses para actualizar el resaltado
            });
            monthListContainer.appendChild(monthListItem);
        }
    }

    function renderDetailedMonth(month) {
        const monthName = new Date(currentYear, month).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const monthDetailHeader = document.createElement('h2');
        monthDetailHeader.classList.add('text-center', 'text-2xl', 'font-semibold', 'mb-4', 'text-gray-700');
        monthDetailHeader.textContent = monthName;

        const calendarGrid = document.createElement('div');
        calendarGrid.classList.add('grid', 'grid-cols-7', 'gap-1', 'bg-white/50', 'rounded-lg', 'shadow-md', 'p-3', 'sm:grid-cols-1', 'md:grid-cols-7', 'backdrop-blur-sm', 'flex-grow');

        // Nombres de los días
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayNames.forEach(name => {
            const dayNameCell = document.createElement('div');
            dayNameCell.classList.add('p-2', 'font-bold', 'text-center', 'bg-gray-200/50', 'rounded-t-md', 'text-gray-600');
            dayNameCell.textContent = name;
            calendarGrid.appendChild(dayNameCell);
        });

        const firstDayOfMonth = new Date(currentYear, month, 1).getDay();
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();

        // Espacios en blanco para el inicio del mes
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('py-4', 'px-3', 'border', 'border-gray-200/50', 'cursor-pointer', 'relative', 'text-sm', 'flex', 'flex-col', 'items-start', 'rounded-md', 'transition-all', 'duration-200', 'ease-in-out', 'hover:bg-blue-50/50', 'hover:shadow-sm');
            const date = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.dataset.date = date;

            // Marcar el día actual
            const today = new Date();
            if (currentYear === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayCell.classList.add('border-blue-500', 'border-4', 'shadow-lg', 'bg-blue-100/50');
            }

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('font-bold', 'text-xl', 'text-gray-700');
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            const tasksOnDay = allTasks.filter(task => task.date === date);
            if (tasksOnDay.length > 0) {
                const taskIndicatorContainer = document.createElement('div');
                taskIndicatorContainer.classList.add('flex', 'flex-wrap', 'gap-1', 'h-4', 'overflow-hidden', 'absolute', 'bottom-1', 'left-1', 'right-1');
                
                const maxIndicators = 3; // Limitar a 3 indicadores
                tasksOnDay.slice(0, maxIndicators).forEach(task => { // Mostrar solo hasta maxIndicators
                    const taskIndicator = document.createElement('span');
                    let priorityColorClass = '';
                    if (task.priority === 'Alta') {
                        priorityColorClass = 'bg-red-500';
                    } else if (task.priority === 'Media') {
                        priorityColorClass = 'bg-yellow-500';
                    } else if (task.priority === 'Baja') {
                        priorityColorClass = 'bg-green-500';
                    }
                    taskIndicator.classList.add('w-3', 'h-3', 'rounded-full', priorityColorClass, 'inline-block', 'tooltip');
                    taskIndicator.setAttribute('title', task.title); // Tooltip para el título
                    taskIndicatorContainer.appendChild(taskIndicator);
                });

                if (tasksOnDay.length > maxIndicators) {
                    const moreIndicator = document.createElement('span');
                    moreIndicator.classList.add('w-3', 'h-3', 'rounded-full', 'bg-gray-400', 'inline-block', 'tooltip', 'flex', 'items-center', 'justify-center', 'text-white', 'text-xs');
                    moreIndicator.textContent = `+${tasksOnDay.length - maxIndicators}`;
                    moreIndicator.setAttribute('title', `Hay ${tasksOnDay.length - maxIndicators} tareas más`);
                    taskIndicatorContainer.appendChild(moreIndicator);
                }
                
                dayCell.appendChild(taskIndicatorContainer);
            }

            dayCell.addEventListener('click', () => openTaskModal(date));
            calendarGrid.appendChild(dayCell);
        }

        // Animación de transición
        detailedMonthView.innerHTML = ''; // Clear previous content
        detailedMonthView.appendChild(monthDetailHeader);
        detailedMonthView.appendChild(calendarGrid);

        // No hay animación de entrada/salida simple con innerHTML, se necesita un enfoque más avanzado
        // Para una animación real, se necesitaría un framework o manejar los elementos DOM directamente
        // Por ahora, la transición se verá como un cambio instantáneo.
    }

    // --- Funciones del Modal ---

    function openTaskModal(date) {
        taskModal.classList.remove('hidden');
        taskModal.dataset.date = date;
        modalDate.textContent = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        document.getElementById('task-title-input').value = '';
        document.getElementById('task-desc-input').value = '';
        document.getElementById('task-priority-input').value = 'Baja';

        renderTasksForDay(date);
    }

    function renderTasksForDay(date) {
        tasksForDayContainer.innerHTML = '';
        const tasksOnDay = allTasks.filter(task => task.date === date);

        if (tasksOnDay.length === 0) {
            tasksForDayContainer.innerHTML = '<p class="text-gray-500">No hay tareas para este día.</p>';
            return;
        }

        tasksOnDay.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('p-3', 'border-b', 'border-gray-200', 'last:border-b-0', 'flex', 'items-center', 'justify-between');
            if (task.completed) {
                taskElement.classList.add('line-through', 'text-gray-400');
            }

            let priorityClass = '';
            if (task.priority === 'Alta') {
                priorityClass = 'bg-red-500';
            } else if (task.priority === 'Media') {
                priorityClass = 'bg-yellow-500';
            } else if (task.priority === 'Baja') {
                priorityClass = 'bg-green-500';
            }
            taskElement.innerHTML = `
                <div class="flex items-center flex-grow">
                    <input type="checkbox" class="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" ${task.completed ? 'checked' : ''} onchange="toggleTaskCompleted(${task.id}, ${task.completed}, '${date}')">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800 mb-1 ${task.completed ? 'line-through' : ''}">${task.title} <span class="${priorityClass} text-white text-xs px-2 py-0.5 rounded-full">${task.priority}</span></h4>
                        <p class="text-gray-600 text-sm mb-2 ${task.completed ? 'line-through' : ''}">${task.description}</p>
                    </div>
                </div>
                <button onclick="deleteTask(${task.id}, '${date}')" class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md"><i class="fas fa-trash-alt mr-1"></i>Eliminar</button>
            `;
            tasksForDayContainer.appendChild(taskElement);
        });
    }

    function addTask(taskData) {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(newTask => {
            allTasks.push(newTask);
            renderDetailedMonth(currentMonth); // Re-renderiza el mes actual para mostrar la nueva tarea
            taskModal.classList.add('hidden');
        });
    }

    window.deleteTask = function(taskId, date) {
        fetch(`${apiUrl}/${taskId}`, { method: 'DELETE' })
            .then(() => {
                allTasks = allTasks.filter(t => t.id !== taskId);
                renderDetailedMonth(currentMonth); // Re-renderiza el mes actual
                renderTasksForDay(date); // Actualiza el modal si sigue abierto
            });
    }

    window.toggleTaskCompleted = function(taskId, currentCompletedStatus, date) {
        const taskToUpdate = allTasks.find(task => task.id === taskId);
        if (!taskToUpdate) return;

        const newCompletedStatus = !currentCompletedStatus;
        taskToUpdate.completed = newCompletedStatus; // Actualiza el estado localmente

        fetch(`${apiUrl}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskToUpdate) // Envía el objeto de tarea actualizado
        })
        .then(response => {
            if (!response.ok) {
                // Si falla, revertir el estado local y mostrar un error
                taskToUpdate.completed = currentCompletedStatus;
                console.error('Error al actualizar la tarea:', response.statusText);
                alert('Error al actualizar la tarea.');
            }
            return response.json();
        })
        .then(updatedTask => {
            // Actualizar allTasks con la tarea actualizada del servidor
            const index = allTasks.findIndex(task => task.id === updatedTask.id);
            if (index !== -1) {
                allTasks[index] = updatedTask;
            }
            renderDetailedMonth(currentMonth); // Re-renderiza el mes actual
            renderTasksForDay(date); // Actualiza el modal si sigue abierto
        })
        .catch(error => {
            taskToUpdate.completed = currentCompletedStatus; // Revertir en caso de error de red
            console.error('Error de red al actualizar la tarea:', error);
            alert('Error de red al actualizar la tarea.');
        });
    };

    function applyWallpaper(imageUrl) {
        const body = document.body;
        if (imageUrl) {
            body.style.backgroundImage = `url('${imageUrl}')`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        } else {
            body.style.backgroundImage = '';
            body.style.backgroundSize = '';
            body.style.backgroundPosition = '';
            body.style.backgroundAttachment = '';
        }
    }

    function loadWallpaper() {
        const savedWallpaper = localStorage.getItem('customWallpaper');
        if (savedWallpaper) {
            applyWallpaper(savedWallpaper);
        }
    }
});