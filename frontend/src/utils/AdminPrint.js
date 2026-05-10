import logo from "../assets/logo.png";

const BUSINESS_INFO = {
    name: "Ebit's Catering & Services",
    owner: "Genaley B. Ebit",
    email: "ebitscatering@gmail.com",
    phone: "0917 679 0643",
    address: "Blk-5 Lot-14 TIERRA VERDE RESIDENCES, BUROL 3, DASMARINAS CITY, CAVITE",
    logo,
};

function escapeHtml(value = "") {
    return String(value ?? "—")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function buildPrintableTable(headers = [], rows = []) {
    const thead = `
        <thead>
            <tr>
                ${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
            </tr>
        </thead>
    `;

    const tbody = `
        <tbody>
            ${rows.length
            ? rows
                .map(
                    (row) => `
                                <tr>
                                    ${row
                            .map(
                                (cell) =>
                                    `<td>${escapeHtml(cell ?? "—")}</td>`
                            )
                            .join("")}
                                </tr>
                            `
                )
                .join("")
            : `
                        <tr>
                            <td colspan="${headers.length || 1}" class="empty-cell">
                                No records available.
                            </td>
                        </tr>
                    `
        }
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
                                <p class="summary-label">${escapeHtml(card.label)}</p>
                                <h3 class="summary-value">${escapeHtml(card.value)}</h3>
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
                <title>${escapeHtml(title)}</title>
                <style>
                    * {
                        box-sizing: border-box;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    body {
                        margin: 0;
                        padding: 28px;
                        color: #1f2937;
                        background: #ffffff;
                    }

                    .report-shell {
                        width: 100%;
                    }

                    .company-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 24px;
                        border-bottom: 3px solid #0b4a3a;
                        padding-bottom: 16px;
                        margin-bottom: 22px;
                    }

                    .company-left {
                        display: flex;
                        align-items: flex-start;
                        gap: 14px;
                        min-width: 0;
                    }

                    .company-logo {
                        width: 72px;
                        height: 72px;
                        object-fit: contain;
                        border-radius: 14px;
                        border: 1px solid #e5e7eb;
                        padding: 6px;
                        background: #ffffff;
                    }

                    .brand {
                        font-size: 13px;
                        letter-spacing: 0.18em;
                        text-transform: uppercase;
                        color: #0b4a3a;
                        font-weight: 800;
                        margin: 0;
                    }

                    .company-name {
                        margin: 5px 0 6px;
                        font-size: 22px;
                        color: #0b4a3a;
                        font-weight: 900;
                        line-height: 1.15;
                    }

                    .company-details {
                        margin: 0;
                        color: #4b5563;
                        font-size: 11px;
                        line-height: 1.55;
                    }

                    .company-right {
                        text-align: right;
                        min-width: 180px;
                    }

                    .official-label {
                        display: inline-block;
                        border: 1px solid #d4af37;
                        background: #fff8e6;
                        color: #8a6a10;
                        border-radius: 999px;
                        padding: 6px 10px;
                        font-size: 10px;
                        font-weight: 800;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                    }

                    .generated-date {
                        margin-top: 10px;
                        color: #6b7280;
                        font-size: 11px;
                        line-height: 1.5;
                    }

                    .report-title-block {
                        margin-bottom: 20px;
                    }

                    .title {
                        margin: 0;
                        font-size: 29px;
                        color: #0b4a3a;
                        font-weight: 900;
                        line-height: 1.15;
                    }

                    .subtitle {
                        margin: 7px 0 0;
                        color: #4b5563;
                        font-size: 13px;
                    }

                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 22px;
                    }

                    .summary-card {
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 12px;
                        background: #f9fafb;
                    }

                    .summary-label {
                        margin: 0;
                        font-size: 11px;
                        color: #6b7280;
                    }

                    .summary-value {
                        margin: 7px 0 0;
                        font-size: 21px;
                        color: #0b4a3a;
                    }

                    .section {
                        margin-bottom: 28px;
                    }

                    .section-title {
                        margin: 0 0 12px;
                        font-size: 19px;
                        color: #0b4a3a;
                        font-weight: 900;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }

                    th, td {
                        border: 1px solid #d1d5db;
                        padding: 9px 10px;
                        text-align: left;
                        vertical-align: top;
                    }

                    th {
                        background: #0b4a3a;
                        color: white;
                        font-weight: 800;
                    }

                    tr:nth-child(even) td {
                        background: #f9fafb;
                    }

                    .empty-cell {
                        text-align: center;
                        color: #6b7280;
                        font-style: italic;
                    }

                    .signature-section {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 36px;
                        margin-top: 44px;
                        page-break-inside: avoid;
                    }

                    .signature-box {
                        text-align: center;
                        font-size: 11px;
                        color: #4b5563;
                    }

                    .signature-line {
                        border-top: 1px solid #111827;
                        padding-top: 7px;
                    }

                    .footer {
                        margin-top: 30px;
                        padding-top: 12px;
                        border-top: 1px solid #e5e7eb;
                        display: flex;
                        justify-content: space-between;
                        gap: 18px;
                        font-size: 10.5px;
                        color: #6b7280;
                    }

                    .footer strong {
                        color: #0b4a3a;
                    }

                    @media print {
                        body {
                            padding: 18px;
                        }

                        .company-header {
                            page-break-inside: avoid;
                        }

                        .summary-grid {
                            page-break-inside: avoid;
                        }

                        .footer {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>

            <body>
                <div class="report-shell">
                    <div class="company-header">
                        <div class="company-left">
                            <img class="company-logo" src="${BUSINESS_INFO.logo}" alt="Company Logo" />
                            <div>
                                <p class="brand">Official Business Report</p>
                                <h2 class="company-name">${escapeHtml(BUSINESS_INFO.name)}</h2>
                                <p class="company-details">
                                    <strong>Owner/Proprietor:</strong> ${escapeHtml(BUSINESS_INFO.owner)}<br />
                                    <strong>Email:</strong> ${escapeHtml(BUSINESS_INFO.email)}<br />
                                    <strong>Contact No.:</strong> ${escapeHtml(BUSINESS_INFO.phone)}<br />
                                    <strong>Address:</strong> ${escapeHtml(BUSINESS_INFO.address)}
                                </p>
                            </div>
                        </div>

                        <div class="company-right">
                            <span class="official-label">Admin Report</span>
                            <div class="generated-date">
                                <strong>Generated on:</strong><br />
                                ${escapeHtml(now)}
                            </div>
                        </div>
                    </div>

                    <div class="report-title-block">
                        <h1 class="title">${escapeHtml(title)}</h1>
                        <p class="subtitle">${escapeHtml(subtitle)}</p>
                    </div>

                    ${summaryHtml}

                    ${content}

                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line">Prepared By / Admin Staff</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line">Owner / Authorized Representative</div>
                        </div>
                    </div>

                    <div class="footer">
                        <div>
                            <strong>${escapeHtml(BUSINESS_INFO.name)}</strong> • Official Admin Report
                        </div>
                        <div>
                            ${escapeHtml(BUSINESS_INFO.email)} | ${escapeHtml(BUSINESS_INFO.phone)}
                        </div>
                    </div>
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