const API_URL = "";

let searchTimeout = null;


// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadTickets();
    loadStats();

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const priorityFilter = document.getElementById("priorityFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");


    // Search as you type
    if (searchInput) {

        searchInput.addEventListener("input", () => {

            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {
                loadTickets();
            }, 300);

        });

    }


    // Filters
    if (statusFilter) {
        statusFilter.addEventListener("change", loadTickets);
    }

    if (priorityFilter) {
        priorityFilter.addEventListener("change", loadTickets);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", loadTickets);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", loadTickets);
    }

});


// ===============================
// LOAD TICKETS
// ===============================

async function loadTickets() {

    const table = document.getElementById("ticketTable");

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const priorityFilter = document.getElementById("priorityFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");


    const search = searchInput
        ? searchInput.value.trim()
        : "";

    const status = statusFilter
        ? statusFilter.value
        : "";

    const priority = priorityFilter
        ? priorityFilter.value
        : "";

    const category = categoryFilter
        ? categoryFilter.value
        : "";

    const sortBy = sortFilter
        ? sortFilter.value
        : "newest";


    // Loading state
    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        Loading tickets...
                    </div>
                </td>
            </tr>
        `;

    }


    hideEmptyState();


    try {

        const params = new URLSearchParams();

        if (search) {
            params.append("search", search);
        }

        if (status) {
            params.append("status", status);
        }

        if (priority) {
            params.append("priority", priority);
        }

        if (category) {
            params.append("category", category);
        }

        params.append("sort_by", sortBy);


        const response = await fetch(
            `${API_URL}/api/tickets?${params.toString()}`
        );


        if (!response.ok) {

            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.detail || "Unable to load tickets"
            );

        }


        const data = await response.json();

const tickets = data.tickets || [];

renderTickets(tickets);
renderCharts(tickets);

updateResultCount(
    data.count || 0
);

        updateLastUpdated();

    } catch (error) {

        console.error("Ticket loading error:", error);

        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="9">
                        <div class="error-state">

                            <div class="error-icon">
                                ⚠
                            </div>

                            <h3>Unable to load tickets</h3>

                            <p>
                                ${escapeHTML(error.message)}
                            </p>

                            <button
                                class="btn btn-primary"
                                onclick="loadTickets()"
                            >
                                Try Again
                            </button>

                        </div>
                    </td>
                </tr>
            `;

        }

    }

}


// ===============================
// RENDER TICKETS
// ===============================

function renderTickets(tickets) {

    const table = document.getElementById("ticketTable");

    if (!table) {
        return;
    }


    if (!tickets || tickets.length === 0) {

        table.innerHTML = "";

        showEmptyState();

        return;
    }


    hideEmptyState();


    table.innerHTML = tickets.map(ticket => {

        const createdDate = formatDate(ticket.created_at);

        const dueDate = ticket.due_date
            ? formatDate(ticket.due_date)
            : "—";


        return `
            <tr>

                <!-- Ticket ID -->
                <td>

                    <a
                        href="ticket-details.html?id=${encodeURIComponent(ticket.ticket_id)}"
                        class="ticket-id"
                    >
                        ${escapeHTML(ticket.ticket_id)}
                    </a>

                </td>


                <!-- Customer -->
                <td>

                    <div class="customer-cell">

                        <div class="mini-avatar">
                            ${getInitials(ticket.customer_name)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(ticket.customer_name)}
                            </strong>

                            <small>
                                ${escapeHTML(ticket.customer_email)}
                            </small>

                        </div>

                    </div>

                </td>


                <!-- Subject -->
                <td>

                    <div class="subject-cell">

                        <strong>
                            ${escapeHTML(ticket.subject)}
                        </strong>

                        <small>
                            Due: ${escapeHTML(dueDate)}
                        </small>

                    </div>

                </td>


                <!-- Category -->
                <td>

                    <span class="category-badge">
                        ${escapeHTML(ticket.category)}
                    </span>

                </td>


                <!-- Priority -->
                <td>

                    <span class="priority-badge ${getPriorityClass(ticket.priority)}">

                        ${getPriorityIcon(ticket.priority)}

                        ${escapeHTML(ticket.priority)}

                    </span>

                </td>


                <!-- Status -->
                <td>

                    <span class="status-badge ${getStatusClass(ticket.status)}">

                        <span class="status-dot-small"></span>

                        ${escapeHTML(ticket.status)}

                    </span>

                </td>


                <!-- Agent -->
                <td>

                    <div class="agent-cell">

                        <div class="agent-avatar">
                            ${getInitials(ticket.assigned_agent)}
                        </div>

                        <span>
                            ${escapeHTML(ticket.assigned_agent)}
                        </span>

                    </div>

                </td>


                <!-- Created -->
                <td>

                    <span class="date-cell">
                        ${escapeHTML(createdDate)}
                    </span>

                </td>


                <!-- Action -->
                <td>

                    <a
                        href="ticket-details.html?id=${encodeURIComponent(ticket.ticket_id)}"
                        class="view-button"
                    >
                        View
                    </a>

                </td>

            </tr>
        `;

    }).join("");

}


// ===============================
// LOAD DASHBOARD STATISTICS
// ===============================

async function loadStats() {

    try {

        const response = await fetch(
            `${API_URL}/api/ticket-stats`
        );


        if (!response.ok) {
            throw new Error("Unable to load statistics");
        }


        const stats = await response.json();


        setText(
            "totalTickets",
            stats.total ?? 0
        );

        setText(
            "openTickets",
            stats.open ?? 0
        );

        setText(
            "progressTickets",
            stats.in_progress ?? 0
        );

        setText(
            "closedTickets",
            stats.closed ?? 0
        );

        setText(
            "urgentTickets",
            stats.urgent ?? 0
        );

        setText(
            "highTickets",
            stats.high ?? 0
        );


    } catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}


// ===============================
// AUTO REFRESH
// ===============================

setInterval(() => {

    loadTickets();
    loadStats();

}, 30000);


// ===============================
// RESULT COUNT
// ===============================

function updateResultCount(count) {

    const element =
        document.getElementById("resultCount");


    if (!element) {
        return;
    }


    element.textContent =
        `${count} ${count === 1 ? "ticket" : "tickets"}`;

}


// ===============================
// LAST UPDATED
// ===============================

function updateLastUpdated() {

    const element =
        document.getElementById("lastUpdated");


    if (!element) {
        return;
    }


    const now = new Date();


    element.textContent =
        `Updated ${now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;

}


// ===============================
// EMPTY STATE
// ===============================

function showEmptyState() {

    const emptyState =
        document.getElementById("emptyState");


    if (emptyState) {
        emptyState.style.display = "flex";
    }

}


function hideEmptyState() {

    const emptyState =
        document.getElementById("emptyState");


    if (emptyState) {
        emptyState.style.display = "none";
    }

}


// ===============================
// STATUS HELPERS
// ===============================

function getStatusClass(status) {

    switch (status) {

        case "Open":
            return "status-open";

        case "In Progress":
            return "status-progress";

        case "Closed":
            return "status-closed";

        default:
            return "";

    }

}


// ===============================
// PRIORITY HELPERS
// ===============================

function getPriorityClass(priority) {

    switch (priority) {

        case "Urgent":
            return "priority-urgent";

        case "High":
            return "priority-high";

        case "Medium":
            return "priority-medium";

        case "Low":
            return "priority-low";

        default:
            return "";

    }

}


function getPriorityIcon(priority) {

    switch (priority) {

        case "Urgent":
            return "!!";

        case "High":
            return "↑";

        case "Medium":
            return "●";

        case "Low":
            return "↓";

        default:
            return "●";

    }

}


// ===============================
// DATE FORMATTER
// ===============================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date = new Date(dateString);


    if (isNaN(date.getTime())) {
        return "—";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ===============================
// INITIALS
// ===============================

function getInitials(name) {

    if (!name) {
        return "?";
    }


    const parts =
        name.trim().split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


// ===============================
// SAFE TEXT
// ===============================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ===============================
// SET TEXT HELPER
// ===============================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = value;
    }

}

// ===============================
// CHARTS
// ===============================

let statusChart = null;
let priorityChart = null;

function renderCharts(tickets) {

    const statusCanvas = document.getElementById("statusChart");
    const priorityCanvas = document.getElementById("priorityChart");

    const statusEmpty = document.getElementById("statusChartEmpty");
    const priorityEmpty = document.getElementById("priorityChartEmpty");

    if (!statusCanvas || !priorityCanvas) {
        console.error("Chart elements not found.");
        return;
    }

    // Destroy old charts before creating new ones
    if (statusChart) {
        statusChart.destroy();
    }

    if (priorityChart) {
        priorityChart.destroy();
    }

    // No tickets
    if (!tickets || tickets.length === 0) {

        statusCanvas.style.display = "none";
        priorityCanvas.style.display = "none";

        if (statusEmpty) {
            statusEmpty.style.display = "flex";
        }

        if (priorityEmpty) {
            priorityEmpty.style.display = "flex";
        }

        return;
    }

    // Tickets exist
    statusCanvas.style.display = "block";
    priorityCanvas.style.display = "block";

    if (statusEmpty) {
        statusEmpty.style.display = "none";
    }

    if (priorityEmpty) {
        priorityEmpty.style.display = "none";
    }

    // =========================
    // STATUS COUNTS
    // =========================

    const statusCounts = {
        "Open": 0,
        "In Progress": 0,
        "Closed": 0
    };

    tickets.forEach(ticket => {

        const status = ticket.status || "Open";

        if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
        }

    });

    // =========================
    // PRIORITY COUNTS
    // =========================

    const priorityCounts = {
        "Urgent": 0,
        "High": 0,
        "Medium": 0,
        "Low": 0
    };

    tickets.forEach(ticket => {

        const priority = ticket.priority || "Medium";

        if (priorityCounts[priority] !== undefined) {
            priorityCounts[priority]++;
        }

    });

    // =========================
    // STATUS CHART
    // =========================

    const statusCtx = statusCanvas.getContext("2d");

    statusChart = new Chart(statusCtx, {

        type: "doughnut",

        data: {
            labels: Object.keys(statusCounts),

            datasets: [{
                data: Object.values(statusCounts),
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "65%",

            plugins: {

                legend: {
                    position: "bottom",

                    labels: {
                        padding: 18,
                        usePointStyle: true
                    }
                }

            }

        }

    });

    // =========================
    // PRIORITY CHART
    // =========================

    const priorityCtx = priorityCanvas.getContext("2d");

    priorityChart = new Chart(priorityCtx, {

        type: "bar",

        data: {

            labels: Object.keys(priorityCounts),

            datasets: [{
                label: "Tickets",
                data: Object.values(priorityCounts),
                borderRadius: 6
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }

            },

            plugins: {

                legend: {
                    display: false
                }

            }

        }

    });

}