const API_URL = "";


const params =
    new URLSearchParams(
        window.location.search
    );


const ticketId =
    params.get("id");


const loading =
    document.getElementById(
        "loading"
    );


const content =
    document.getElementById(
        "content"
    );


document.addEventListener(
    "DOMContentLoaded",
    loadTicket
);


async function loadTicket() {

    if (!ticketId) {

        loading.textContent =
            "Invalid ticket ID.";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/tickets/${encodeURIComponent(
                    ticketId
                )}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Ticket not found."
            );

        }


        renderTicket(
            data.ticket,
            data.notes
        );


        loading.style.display =
            "none";

        content.style.display =
            "block";


    } catch (error) {

        loading.innerHTML = `

            <div class="error-state">

                <h3>
                    ⚠ ${escapeHTML(
                        error.message
                    )}
                </h3>

                <br>

                <a
                    href="index.html"
                    class="btn btn-secondary"
                >
                    Back to Tickets
                </a>

            </div>

        `;

    }

}


function renderTicket(
    ticket,
    notes
) {

    setText(
        "ticketSubject",
        ticket.subject
    );

    setText(
        "ticketId",
        ticket.ticket_id
    );

    setText(
        "customerName",
        ticket.customer_name
    );

    setText(
        "customerEmail",
        ticket.customer_email
    );

    setText(
        "category",
        ticket.category
    );

    setText(
        "priority",
        ticket.priority
    );

    setText(
        "agent",
        ticket.assigned_agent
    );

    setText(
        "created",
        formatDateTime(
            ticket.created_at
        )
    );

    setText(
        "dueDate",
        ticket.due_date
            ? formatDateTime(
                ticket.due_date
            )
            : "No due date"
    );


    document.getElementById(
        "description"
    ).textContent =
        ticket.description;


    const status =
        document.getElementById(
            "ticketStatus"
        );


    status.textContent =
        ticket.status;


    status.className =
        `status ${
            statusClass(
                ticket.status
            )
        }`;


    document.getElementById(
        "status"
    ).value =
        ticket.status;


    document.getElementById(
        "updatePriority"
    ).value =
        ticket.priority;


    document.getElementById(
        "updateCategory"
    ).value =
        ticket.category;


    document.getElementById(
        "updateAgent"
    ).value =
        ticket.assigned_agent;


    renderNotes(notes);

}


function renderNotes(notes) {

    const container =
        document.getElementById(
            "notes"
        );


    if (!notes || !notes.length) {

        container.innerHTML = `

            <p style="
                color:#94a3b8;
                font-size:11px;
            ">
                No internal notes yet.
            </p>

        `;

        return;

    }


    container.innerHTML =
        notes.map(note => `

        <div class="note">

            <p>
                ${escapeHTML(
                    note.note_text
                )}
            </p>

            <small>
                ${formatDateTime(
                    note.created_at
                )}
            </small>

        </div>

    `).join("");

}


// UPDATE

document.getElementById(
    "updateButton"
).addEventListener(
    "click",
    updateTicket
);


async function updateTicket() {

    const button =
        document.getElementById(
            "updateButton"
        );


    const message =
        document.getElementById(
            "updateMessage"
        );


    const data = {

        status:
            document.getElementById(
                "status"
            ).value,

        priority:
            document.getElementById(
                "updatePriority"
            ).value,

        category:
            document.getElementById(
                "updateCategory"
            ).value,

        assigned_agent:
            document.getElementById(
                "updateAgent"
            ).value,

        notes:
            document.getElementById(
                "note"
            ).value.trim()

    };


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/tickets/${encodeURIComponent(
                    ticketId
                )}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.detail ||
                "Update failed."
            );

        }


        message.style.color =
            "#047857";

        message.textContent =
            "✓ Changes saved successfully.";


        document.getElementById(
            "note"
        ).value = "";


        await loadTicket();


        setTimeout(
            () => {
                message.textContent = "";
            },
            2500
        );


    } catch (error) {

        message.style.color =
            "#b91c1c";

        message.textContent =
            error.message;

    }


    button.disabled = false;

    button.textContent =
        "Save Changes";

}


// DELETE

document.getElementById(
    "deleteButton"
).addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                `Delete ${ticketId}? This action cannot be undone.`
            );


        if (!confirmed)
            return;


        try {

            const response =
                await fetch(
                    `${API_URL}/api/tickets/${encodeURIComponent(
                        ticketId
                    )}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to delete ticket."
                );

            }


            window.location.href =
                "index.html";


        } catch (error) {

            alert(
                error.message
            );

        }

    }
);


// HELPERS

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element)
        element.textContent =
            value ?? "—";

}


function formatDateTime(value) {

    if (!value)
        return "—";


    return new Date(value)
        .toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


function statusClass(status) {

    return {
        "Open": "open",
        "In Progress": "progress",
        "Closed": "closed"
    }[status] || "";

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}