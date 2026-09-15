const API_URL = "http://127.0.0.1:8000";

async function loadTickets() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const table = document.getElementById("ticketTable");
    table.innerHTML = `
    <tr>
        <td colspan="6">
            <div class="loading-state">
                <div class="spinner"></div>
                Loading tickets...
            </div>
        </td>
    </tr>
`;

    const search = searchInput.value.trim();
    const status = statusFilter.value;

    let url = `${API_URL}/api/tickets?`;

    if (search) {
        url += `search=${encodeURIComponent(search)}&`;
    }

    if (status) {
        url += `status=${encodeURIComponent(status)}&`;
    }

    try {
        // Load tickets and statistics together
        const [ticketsResponse, statsResponse] = await Promise.all([
            fetch(url),
            fetch(`${API_URL}/api/ticket-stats`)
        ]);

        if (!ticketsResponse.ok || !statsResponse.ok) {
            throw new Error("Failed to fetch data from the server");
        }

        const tickets = await ticketsResponse.json();
        const stats = await statsResponse.json();

        // Update summary cards
        document.getElementById("totalTickets").textContent = stats.total;
        document.getElementById("openTickets").textContent = stats.open;
        document.getElementById("progressTickets").textContent =
            stats.in_progress;
        document.getElementById("closedTickets").textContent = stats.closed;

        // Clear existing table rows
        table.innerHTML = "";

        if (tickets.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No tickets found.
                    </td>
                </tr>
            `;
            return;
        }

        // Display tickets
        tickets.forEach(ticket => {
            let statusClass = "closed";

            if (ticket.status === "Open") {
                statusClass = "open";
            } else if (ticket.status === "In Progress") {
                statusClass = "progress";
            }

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <strong>${escapeHTML(ticket.ticket_id)}</strong>
                </td>

                <td>
                    ${escapeHTML(ticket.customer_name)}
                    <small class="customer-email">
                        ${escapeHTML(ticket.customer_email || "")}
                    </small>
                </td>

                <td>
                    ${escapeHTML(ticket.subject)}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${escapeHTML(ticket.status)}
                    </span>
                </td>

                <td>
                    ${formatDate(ticket.created_at)}
                </td>

                <td>
                    <a
                        class="view-link"
                        href="ticket-details.html?id=${encodeURIComponent(ticket.ticket_id)}"
                    >
                        View →
                    </a>
                </td>
            `;

            table.appendChild(row);
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="6" class="error-state">
                    Unable to connect to the backend.
                    Please check whether FastAPI is running.
                </td>
            </tr>
        `;
    }
}


// Format date and time
function formatDate(dateValue) {
    if (!dateValue) {
        return "N/A";
    }

    return new Date(dateValue).toLocaleString();
}


// Prevent unsafe HTML rendering
function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// Automatic search while typing
document
    .getElementById("searchInput")
    .addEventListener("input", loadTickets);


// Automatic filtering when status changes
document
    .getElementById("statusFilter")
    .addEventListener("change", loadTickets);


// Initial load
loadTickets();


// Refresh dashboard every 30 seconds
setInterval(loadTickets, 30000);