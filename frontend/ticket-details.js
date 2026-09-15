const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");

async function loadTicket() {
    if (!ticketId) {
        document.getElementById("ticketDetails").textContent =
            "Ticket ID is missing.";
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/tickets/${ticketId}`
        );

        if (!response.ok) {
            throw new Error("Ticket not found");
        }

        const ticket = await response.json();

        document.getElementById("ticketDetails").innerHTML = `
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
            <p><strong>Customer:</strong> ${ticket.customer_name}</p>
            <p><strong>Email:</strong> ${ticket.customer_email}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Description:</strong> ${ticket.description}</p>
            <p><strong>Created:</strong>
                ${new Date(ticket.created_at).toLocaleString()}
            </p>
            <p><strong>Updated:</strong>
                ${new Date(ticket.updated_at).toLocaleString()}
            </p>
        `;

        document.getElementById("status").value = ticket.status;

        if (ticket.notes && ticket.notes.length > 0) {
            document.getElementById("ticketDetails").innerHTML += `
                <h3>Previous Notes</h3>
                <ul>
                    ${ticket.notes.map(note => `
                        <li>
                            ${note.note_text}
                            <small>
                                (${new Date(note.created_at).toLocaleString()})
                            </small>
                        </li>
                    `).join("")}
                </ul>
            `;
        }

    } catch (error) {
        document.getElementById("ticketDetails").textContent =
            error.message;
    }
}

async function updateTicket() {
    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value;

    try {
        const response = await fetch(
            `${API_URL}/api/tickets/${ticketId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status,
                    notes: notes
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Update failed");
        }

        document.getElementById("message").textContent =
            "Ticket updated successfully.";

        document.getElementById("notes").value = "";

        loadTicket();

    } catch (error) {
        document.getElementById("message").textContent =
            error.message;
    }
}

loadTicket();