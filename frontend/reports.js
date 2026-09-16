const API_URL = "http://127.0.0.1:8000";

let statusChart = null;

let priorityChart = null;


document.addEventListener(
    "DOMContentLoaded",
    loadReports
);


async function loadReports() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/tickets`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Unable to load report data."
            );

        }


        const tickets =
            data.tickets || [];


        generateReport(
            tickets
        );


    } catch (error) {

        console.error(
            error
        );

    }

}


function generateReport(
    tickets
) {

    const total =
        tickets.length;


    const closed =
        tickets.filter(
            ticket =>
                ticket.status ===
                "Closed"
        ).length;


    const open =
        tickets.filter(
            ticket =>
                ticket.status !==
                "Closed"
        ).length;


    const urgent =
        tickets.filter(
            ticket =>
                ticket.priority ===
                "Urgent"
        ).length;


    const customers =
        new Set(
            tickets.map(
                ticket =>
                    ticket.customer_email
                        .toLowerCase()
            )
        ).size;


    const resolutionRate =
        total
            ? Math.round(
                (closed / total) * 100
            )
            : 0;


    setText(
        "resolutionRate",
        `${resolutionRate}%`
    );


    setText(
        "openWorkload",
        open
    );


    setText(
        "urgentReport",
        urgent
    );


    setText(
        "customerReport",
        customers
    );


    renderStatusChart(
        tickets
    );


    renderPriorityChart(
        tickets
    );


    renderCategories(
        tickets
    );

}


function renderStatusChart(
    tickets
) {

    const counts = {

        Open: 0,

        "In Progress": 0,

        Closed: 0

    };


    tickets.forEach(
        ticket => {

            if (
                Object.hasOwn(
                    counts,
                    ticket.status
                )
            ) {

                counts[
                    ticket.status
                ]++;

            }

        }
    );


    const canvas =
        document.getElementById(
            "statusReportChart"
        );


    if (statusChart) {

        statusChart.destroy();

    }


    statusChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Open",
                        "In Progress",
                        "Closed"
                    ],

                    datasets: [

                        {

                            data: [
                                counts.Open,
                                counts[
                                    "In Progress"
                                ],
                                counts.Closed
                            ],

                            backgroundColor: [
                                "#22c55e",
                                "#3b82f6",
                                "#94a3b8"
                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                padding: 15,

                                font: {
                                    size: 10
                                }

                            }

                        }

                    }

                }

            }
        );

}


function renderPriorityChart(
    tickets
) {

    const counts = {

        Urgent: 0,

        High: 0,

        Medium: 0,

        Low: 0

    };


    tickets.forEach(
        ticket => {

            if (
                Object.hasOwn(
                    counts,
                    ticket.priority
                )
            ) {

                counts[
                    ticket.priority
                ]++;

            }

        }
    );


    const canvas =
        document.getElementById(
            "priorityReportChart"
        );


    if (priorityChart) {

        priorityChart.destroy();

    }


    priorityChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Urgent",
                        "High",
                        "Medium",
                        "Low"
                    ],

                    datasets: [

                        {

                            data: [

                                counts.Urgent,

                                counts.High,

                                counts.Medium,

                                counts.Low

                            ],

                            backgroundColor: [

                                "#ef4444",

                                "#f97316",

                                "#eab308",

                                "#22c55e"

                            ],

                            borderRadius: 6

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            },

                            grid: {
                                color: "#f1f5f9"
                            }

                        },

                        x: {

                            grid: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}


function renderCategories(
    tickets
) {

    const counts = {};


    tickets.forEach(
        ticket => {

            counts[
                ticket.category
            ] =
                (
                    counts[
                        ticket.category
                    ] || 0
                ) + 1;

        }
    );


    const sorted =
        Object.entries(
            counts
        ).sort(
            (
                a,
                b
            ) => b[1] - a[1]
        );


    const maximum =
        sorted.length
            ? sorted[0][1]
            : 1;


    const container =
        document.getElementById(
            "categoryList"
        );


    if (!sorted.length) {

        container.innerHTML = `

            <div class="activity-empty">

                No ticket data available.

            </div>

        `;

        return;

    }


    container.innerHTML =
        sorted.map(
            ([category, count]) => `

            <div class="category-row">

                <div class="category-name">

                    ${escapeHTML(
                        category
                    )}

                </div>


                <div class="progress-track">

                    <div
                        class="progress-value"
                        style="width:${
                            (count / maximum) * 100
                        }%;"
                    ></div>

                </div>


                <div class="category-number">

                    ${count}

                </div>

            </div>

        `
        ).join("");

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


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