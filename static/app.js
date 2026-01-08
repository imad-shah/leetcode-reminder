let problems = [];
let currentSort = { field: 'due', ascending: true };

// fetches problems from /problems endpoint
async function fetchProblems() {
    const response = await fetch('/problems');
    problems = await response.json();
    render();
}

// finds the day a problem is due 
function getStatus(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    return 'upcoming';
}
// date formatter
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderStats() {
    const stats = document.getElementById('stats');
    const overdue = problems.filter(p => getStatus(p.due) === 'overdue').length;
    const dueToday = problems.filter(p => getStatus(p.due) === 'due-today').length;
    
    stats.innerHTML = `
        <span>Total: ${problems.length}</span>
        <span>Overdue: ${overdue}</span>
        <span>Due Today: ${dueToday}</span>
    `;
}

function toTitleCase(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function renderDueProblems() {
    const container = document.getElementById('due-problems');
    const MAX_DUE_CARDS = 5;
    
    const dueProblems = problems
        .filter(p => {
            const status = getStatus(p.due);
            return status === 'overdue' || status === 'due-today';
        })
        .sort((a, b) => new Date(a.due) - new Date(b.due))
        .slice(0, MAX_DUE_CARDS);
    
    const totalDue = problems.filter(p => {
        const status = getStatus(p.due);
        return status === 'overdue' || status === 'due-today';
    }).length;
    
    if (dueProblems.length === 0) {
        container.innerHTML = '<p class="empty-message">No problems due. Nice work!</p>';
        return;
    }
    
    let html = dueProblems.map(p => `
        <div class="due-card">
            <div class="problem-name">${toTitleCase(p.problem)}</div>
            <div class="due-date">${formatDate(p.due)}</div>
        </div>
    `).join('');
    
    if (totalDue > MAX_DUE_CARDS) {
        html += `<div class="due-card more-card">+${totalDue - MAX_DUE_CARDS} more</div>`;
    }
    
    container.innerHTML = html;
}

function renderTable() {
    const tbody = document.querySelector('#problems-table tbody');
    
    const sorted = [...problems].sort((a, b) => {
        if (!currentSort.field) return 0;
        
        let aVal = a[currentSort.field];
        let bVal = b[currentSort.field];
        
        if (currentSort.field === 'due' || currentSort.field === 'submitted_at') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    
    tbody.innerHTML = sorted.map(p => {
        const status = getStatus(p.due);
        const statusLabel = status === 'due-today' ? 'Due Today' : 
                           status === 'overdue' ? 'Overdue' : 'Upcoming';
        
        return `
            <tr>
                <td>${toTitleCase(p.problem)}</td>
                <td>${p.difficulty}</td>
                <td>${formatDate(p.submitted_at)}</td>
                <td>${formatDate(p.due)}</td>
                <td><span class="status ${status}">${statusLabel}</span></td>
            </tr>
        `;
    }).join('');
    
    updateSortIndicators();
}
function updateSortIndicators() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        const field = th.dataset.sort;
        const baseText = th.textContent.replace(/ [↕▲▼]$/, '');
        
        if (currentSort.field === field) {
            th.textContent = baseText + (currentSort.ascending ? ' ▲' : ' ▼');
        } else {
            th.textContent = baseText + ' ↕';
        }
    });
}

function render() {
    renderStats();
    renderDueProblems();
    renderTable();
}

document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (currentSort.field === field) {
            currentSort.ascending = !currentSort.ascending;
        } else {
            currentSort.field = field;
            currentSort.ascending = false;
        }
        renderTable();
    });
});

fetchProblems();
