const API_URL = "";


const form =
    document.getElementById(
        "ticketForm"
    );


form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const button =
            document.getElementById(
                "submitButton"
            );


        const message =
            document.getElementById(
                "message"
            );


        button.disabled = true;

        button.textContent =
            "Creating...";


        message.className =
            "message";

        message.textContent =
            "";


        const data = {

            customer_name:
                document.getElementById(
                    "customerName"
                ).value.trim(),

            customer_email:
                document.getElementById(
                    "customerEmail"
                ).value.trim(),

            subject:
                document.getElementById(
                    "subject"
                ).value.trim(),

            description:
                document.getElementById(
                    "description"
                ).value.trim(),

            priority:
                document.getElementById(
                    "priority"
                ).value,

            category:
                document.getElementById(
                    "category"
                ).value,

            assigned_agent:
                document.getElementById(
                    "assignedAgent"
                ).value,

            due_date:
                document.getElementById(
                    "dueDate"
                ).value
                    ? new Date(
                        document.getElementById(
                            "dueDate"
                        ).value
                    ).toISOString()
                    : null
        };


        try {

            const response =
                await fetch(
                    `${API_URL}/api/tickets`,
                    {
                        method: "POST",

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
                    "Failed to create ticket."
                );

            }


            message.className =
                "message success";

            message.style.display =
                "block";

            message.style.background =
                "#ecfdf5";

            message.style.color =
                "#047857";

            message.textContent =
                `Ticket ${
                    result.ticket.ticket_id
                } created successfully.`;


            setTimeout(
                () => {

                    window.location.href =
                        `ticket-details.html?id=${
                            encodeURIComponent(
                                result.ticket.ticket_id
                            )
                        }`;

                },
                700
            );


        } catch (error) {

            message.className =
                "message error";

            message.textContent =
                error.message;

            message.style.display =
                "block";


            button.disabled = false;

            button.textContent =
                "Create Ticket";

        }

    }
);