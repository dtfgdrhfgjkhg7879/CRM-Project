const API_URL = "http://127.0.0.1:8000";

let allCustomers = [];


document.addEventListener(
    "DOMContentLoaded",
    loadCustomers
);


async function loadCustomers() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/tickets`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Unable to load customers."
            );

        }


        buildCustomers(
            data.tickets || []
        );


        setupSearch();


    } catch (error) {

        document.getElementById(
            "customerTable"
        ).innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="customer-empty">

                        ⚠ ${escapeHTML(
                            error.message
                        )}

                    </div>

                </td>

            </tr>

        `;

    }

}


function buildCustomers(tickets) {

    const customerMap =
        new Map();


    tickets.forEach(ticket => {

        const key =
            ticket.customer_email
                .toLowerCase();


        if (!customerMap.has(key)) {

            customerMap.set(
                key,
                {

                    name:
                        ticket.customer_name,

                    email:
                        ticket.customer_email,

                    tickets: [],

                    lastActivity:
                        ticket.updated_at

                }
            );

        }


        const customer =
            customerMap.get(key);


        customer.tickets.push(
            ticket
        );


        if (
            new Date(
                ticket.updated_at
            ) >
            new Date(
                customer.lastActivity
            )
        ) {

            customer.lastActivity =
                ticket.updated_at;

        }

    });


    allCustomers =
        Array.from(
            customerMap.values()
        );


    updateSummary();

    renderCustomers(
        allCustomers
    );

}


function updateSummary() {

    const total =
        allCustomers.length;


    const active =
        allCustomers.filter(
            customer =>
                customer.tickets.some(
                    ticket =>
                        ticket.status !==
                        "Closed"
                )
        ).length;


    const open =
        allCustomers.reduce(
            (sum, customer) =>
                sum +
                customer.tickets.filter(
                    ticket =>
                        ticket.status ===
                        "Open"
                ).length,
            0
        );


    const requests =
        allCustomers.reduce(
            (sum, customer) =>
                sum +
                customer.tickets.length,
            0
        );


    setText(
        "totalCustomers",
        total
    );

    setText(
        "activeCustomers",
        active
    );

    setText(
        "openRequests",
        open
    );

    setText(
        "totalRequests",
        requests
    );

}


function renderCustomers(
    customers
) {

    const table =
        document.getElementById(
            "customerTable"
        );


    if (!customers.length) {

        table.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="customer-empty">

                        No customers found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        customers.map(
            customer => {

                const tickets =
                    customer.tickets;


                const open =
                    tickets.filter(
                        ticket =>
                            ticket.status ===
                            "Open"
                    ).length;


                const closed =
                    tickets.filter(
                        ticket =>
                            ticket.status ===
                            "Closed"
                    ).length;


                const active =
                    tickets.some(
                        ticket =>
                            ticket.status !==
                            "Closed"
                    );


                return `

                <tr>

                    <td>

                        <div class="customer-row">

                            <div class="customer-big-avatar">

                                ${getInitials(
                                    customer.name
                                )}

                            </div>


                            <div class="customer-name">

                                <strong>
                                    ${escapeHTML(
                                        customer.name
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        customer.email
                                    )}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>

                        <span class="ticket-count">

                            ${tickets.length}

                        </span>

                    </td>


                    <td>

                        ${open}

                    </td>


                    <td>

                        ${closed}

                    </td>


                    <td>

                        ${formatDate(
                            customer.lastActivity
                        )}

                    </td>


                    <td>

                        <span class="customer-status">

                            ${
                                active
                                    ? "Active"
                                    : "No Open Requests"
                            }

                        </span>

                    </td>

                </tr>

                `;

            }
        ).join("");

}


function setupSearch() {

    const input =
        document.getElementById(
            "customerSearch"
        );


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            const filtered =
                allCustomers.filter(
                    customer =>

                        customer.name
                            .toLowerCase()
                            .includes(query)

                        ||

                        customer.email
                            .toLowerCase()
                            .includes(query)
                );


            renderCustomers(
                filtered
            );

        }
    );

}


function getInitials(name) {

    const parts =
        name
            .trim()
            .split(/\s+/);


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


function formatDate(value) {

    if (!value)
        return "—";


    return new Date(value)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element)
        element.textContent =
            value;

}


function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}