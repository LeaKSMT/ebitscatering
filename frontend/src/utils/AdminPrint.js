export function buildPrintableTable(headers = [], rows = []) {
    const thead = `
        <thead>
            <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
        </thead>
    `;

    const tbody = `
        <tbody>
            ${rows
            .map(
                (row) => `
                        <tr>
                            ${row.map((cell) => `<td>${cell ?? "—"}</td>`).join("")}
                        </tr>
                    `
            )
            .join("")}
        </tbody>
    `;

    return `<table>${thead}${tbody}</table>`;
}

export function openPrintWindow({
    title = "Report",
    subtitle = "",
    summaryCards = [],
    content = "",
}) {
    const printWindow = window.open("", "_blank", "width=1100,height=800");

    if (!printWindow) {
        alert("Unable to open print window. Please allow pop-ups for this site.");
        return;
    }

    const now = new Date().toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    const summaryHtml = summaryCards.length
        ? `
            <div class="summary-grid">
                ${summaryCards
            .map(
                (card) => `
                            <div class="summary-card">
                                <p class="summary-label">${card.label}</p>
                                <h3 class="summary-value">${card.value}</h3>
                            </div>
                        `
            )
            .join("")}
            </div>
        `
        : "";

    printWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
                    * {
                        box-sizing: border-box;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    body {
                        margin: 0;
                        padding: 32px;
                        color: #1f2937;
                        background: #ffffff;
                    }

                    .header {
                        border-bottom: 3px solid #0b4a3a;
                        padding-bottom: 16px;
                        margin-bottom: 24px;
                    }

                    .brand {
                        font-size: 14px;
                        letter-spacing: 0.18em;
                        text-transform: uppercase;
                        color: #6b7280;
                        font-weight: 700;
                    }

                    .title {
                        margin: 8px 0 0;
                        font-size: 30px;
                        color: #0b4a3a;
                        font-weight: 800;
                    }

                    .subtitle {
                        margin: 8px 0 0;
                        color: #4b5563;
                        font-size: 14px;
                    }

                    .meta {
                        margin-top: 12px;
                        font-size: 12px;
                        color: #6b7280;
                    }

                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        margin-bottom: 24px;
                    }

                    .summary-card {
                        border: 1px solid #e5e7eb;
                        border-radius: 14px;
                        padding: 14px;
                        background: #f9fafb;
                    }

                    .summary-label {
                        margin: 0;
                        font-size: 12px;
                        color: #6b7280;
                    }

                    .summary-value {
                        margin: 8px 0 0;
                        font-size: 24px;
                        color: #0b4a3a;
                    }

                    .section {
                        margin-bottom: 28px;
                    }

                    .section-title {
                        margin: 0 0 12px;
                        font-size: 20px;
                        color: #0b4a3a;
                        font-weight: 800;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }

                    th, td {
                        border: 1px solid #d1d5db;
                        padding: 10px 12px;
                        text-align: left;
                        vertical-align: top;
                    }

                    th {
                        background: #0b4a3a;
                        color: white;
                        font-weight: 700;
                    }

                    tr:nth-child(even) td {
                        background: #f9fafb;
                    }

                    .footer {
                        margin-top: 32px;
                        padding-top: 12px;
                        border-top: 1px solid #e5e7eb;
                        font-size: 12px;
                        color: #6b7280;
                        text-align: right;
                    }

                    @media print {
                        body {
                            padding: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="brand">Ebit's Catering & Services</div>
                    <h1 class="title">${title}</h1>
                    <p class="subtitle">${subtitle}</p>
                    <div class="meta">Generated on: ${now}</div>
                </div>

                ${summaryHtml}

                ${content}

                <div class="footer">
                    Ebit's Catering & Services • Admin Report
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
        </html>
    `);

    printWindow.document.close();
}