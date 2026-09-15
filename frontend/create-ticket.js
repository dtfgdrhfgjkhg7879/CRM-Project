const API_URL = "http://127.0.0.1:8000";

document.getElementById("ticketForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const ticketData = {
        customer_name: document.getElementById("customerName").value,
        customer_email: document.getElementById("customerEmail").value,
        subject: document.getElementById("subject").value,
        description: document.getElementById("description").value
    };

    try {
        const response = await fetch(`${API_URL}/api/tickets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ticketData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Failed to create ticket");
        }

        document.getElementById("message").textContent =
            `Ticket created successfully: ${result.ticket_id}`;

        document.getElementById("ticketForm").reset();

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);

    } catch (error) {
        document.getElementById("message").textContent =
            error.message;
    }
});