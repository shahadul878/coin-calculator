import type { CoinRequest, CoinRequestReport } from "@/types";
import { formatDateRangeLabel } from "@/lib/utils/date-range";
import { formatCoinAmount } from "@/lib/utils/coin-amount";
import PDFDocument from "pdfkit";

const COLORS = {
  navy: "#0f172a",
  gold: "#f59e0b",
  goldDark: "#d97706",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "#e2e8f0",
  rowAlt: "#f8fafc",
  white: "#ffffff",
  text: "#0f172a",
  muted: "#475569",
};

const PAGE = {
  margin: 48,
  width: 595.28,
  height: 841.89,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatReportDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatPaymentMethod(
  method: CoinRequest["payment_method"],
  other: string | null
): string {
  if (!method) return "-";
  if (method === "others" && other) return other;
  if (method === "bkash") return "Bkash";
  if (method === "nagad") return "Nagad";
  return "Others";
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function buildFilterLines(report: CoinRequestReport): string[] {
  const lines: string[] = [];
  const range = formatDateRangeLabel(
    report.filters.dateFrom,
    report.filters.dateTo
  );
  if (range) lines.push(`Period: ${range}`);
  if (report.filters.requestId) {
    lines.push(`Request ID: ${report.filters.requestId.padStart(6, "0")}`);
  }
  if (report.filters.whoRequested) {
    lines.push(`Requested by: ${report.filters.whoRequested}`);
  }
  if (lines.length === 0) lines.push("Period: All records");
  return lines;
}

type PDFDoc = InstanceType<typeof PDFDocument>;

function drawHeader(doc: PDFDoc, pageNumber: number) {
  const contentWidth = PAGE.width - PAGE.margin * 2;

  doc.save();
  doc.rect(0, 0, PAGE.width, 88).fill(COLORS.navy);
  doc.rect(0, 84, PAGE.width, 4).fill(COLORS.gold);

  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(20);
  doc.text("Coin Requests", PAGE.margin, 28, { width: contentWidth });

  doc.fillColor(COLORS.slateLight).font("Helvetica").fontSize(10);
  doc.text("MANAGEMENT REPORT", PAGE.margin, 52);

  doc.fillColor(COLORS.white).font("Helvetica").fontSize(9);
  doc.text(`Page ${pageNumber}`, PAGE.margin, 28, {
    width: contentWidth,
    align: "right",
  });
  doc.restore();

  doc.y = 108;
}

function drawFooter(doc: PDFDoc) {
  const footerY = PAGE.height - 36;
  const contentWidth = PAGE.width - PAGE.margin * 2;

  doc.save();
  doc.strokeColor(COLORS.border).lineWidth(1);
  doc.moveTo(PAGE.margin, footerY - 8).lineTo(PAGE.margin + contentWidth, footerY - 8).stroke();

  doc.fillColor(COLORS.slate).font("Helvetica").fontSize(8);
  doc.text(
    `Generated ${formatReportDateTime(new Date().toISOString())} · Coin Requests System`,
    PAGE.margin,
    footerY,
    { width: contentWidth, align: "left" }
  );
  doc.text("Confidential", PAGE.margin, footerY, {
    width: contentWidth,
    align: "right",
  });
  doc.restore();
}

function drawStatBox(
  doc: PDFDoc,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
) {
  doc.save();
  doc.roundedRect(x, y, width, 58, 6).fillAndStroke(COLORS.rowAlt, COLORS.border);
  doc.fillColor(COLORS.slate).font("Helvetica").fontSize(8);
  doc.text(label.toUpperCase(), x + 12, y + 12, { width: width - 24 });
  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(14);
  doc.text(value, x + 12, y + 28, { width: width - 24 });
  doc.restore();
}

function drawSummaryPanel(
  doc: PDFDoc,
  x: number,
  y: number,
  width: number,
  title: string,
  rows: { label: string; value: string }[]
) {
  const height = 34 + rows.length * 22;
  doc.save();
  doc.roundedRect(x, y, width, height, 6).stroke(COLORS.border);
  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(10);
  doc.text(title, x + 14, y + 12);
  let rowY = y + 30;
  rows.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.rect(x + 1, rowY - 2, width - 2, 20).fill(COLORS.rowAlt);
    }
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9);
    doc.text(row.label, x + 14, rowY, { width: width / 2 });
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(9);
    doc.text(row.value, x + width / 2, rowY, {
      width: width / 2 - 14,
      align: "right",
    });
    rowY += 22;
  });
  doc.restore();
  return height;
}

const TABLE_COLUMNS = [
  { label: "ID", width: 42 },
  { label: "Requested By", width: 88 },
  { label: "Price", width: 52 },
  { label: "Coins", width: 48 },
  { label: "Payment", width: 48 },
  { label: "Send", width: 42 },
  { label: "Method", width: 52 },
  { label: "Created", width: 95 },
];

function drawTableHeader(doc: PDFDoc, y: number): number {
  let x = PAGE.margin;
  doc.save();
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 24).fill(COLORS.navy);
  TABLE_COLUMNS.forEach((col) => {
    doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(8);
    doc.text(col.label, x + 6, y + 8, { width: col.width - 10 });
    x += col.width;
  });
  doc.restore();
  return y + 24;
}

function drawTableRow(doc: PDFDoc, y: number, row: CoinRequest, alt: boolean): number {
  const rowHeight = 22;
  const tableWidth = PAGE.width - PAGE.margin * 2;

  if (alt) {
    doc.save();
    doc.rect(PAGE.margin, y, tableWidth, rowHeight).fill(COLORS.rowAlt);
    doc.restore();
  }

  const values = [
    row.request_id,
    truncate(row.who_requested, 18),
    formatCurrency(row.price),
    formatCoinAmount(row.coin_amount),
    capitalize(row.payment_status),
    capitalize(row.send_status),
    truncate(formatPaymentMethod(row.payment_method, row.payment_method_other), 10),
    formatReportDateTime(row.created_at),
  ];

  let x = PAGE.margin;
  values.forEach((value, index) => {
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(8);
    doc.text(value, x + 6, y + 6, { width: TABLE_COLUMNS[index].width - 10 });
    x += TABLE_COLUMNS[index].width;
  });

  doc.save();
  doc.strokeColor(COLORS.border).lineWidth(0.5);
  doc.moveTo(PAGE.margin, y + rowHeight).lineTo(PAGE.margin + tableWidth, y + rowHeight).stroke();
  doc.restore();

  return y + rowHeight;
}

export async function generateCoinRequestReportPdf(
  report: CoinRequestReport
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE.margin,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNumber = 1;
    drawHeader(doc, pageNumber);

    const contentWidth = PAGE.width - PAGE.margin * 2;
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(16);
    doc.text("Coin Request Report", PAGE.margin, doc.y, { width: contentWidth });
    doc.moveDown(0.4);

    doc.fillColor(COLORS.slate).font("Helvetica").fontSize(10);
    buildFilterLines(report).forEach((line) => {
      doc.text(line, PAGE.margin, doc.y, { width: contentWidth });
      doc.moveDown(0.2);
    });
    doc.moveDown(0.8);

    const statsY = doc.y;
    const statWidth = (contentWidth - 18) / 4;
    const { summary } = report;
    drawStatBox(doc, PAGE.margin, statsY, statWidth, "Total Records", String(summary.totalRecords));
    drawStatBox(
      doc,
      PAGE.margin + statWidth + 6,
      statsY,
      statWidth,
      "Total Coins",
      formatCoinAmount(summary.totalCoins)
    );
    drawStatBox(
      doc,
      PAGE.margin + (statWidth + 6) * 2,
      statsY,
      statWidth,
      "Total Price",
      formatCurrency(summary.totalPrice)
    );
    drawStatBox(
      doc,
      PAGE.margin + (statWidth + 6) * 3,
      statsY,
      statWidth,
      "Outstanding",
      formatCurrency(
        report.rows
          .filter((row) => row.payment_status === "due" || row.payment_status === "partial")
          .reduce((sum, row) => sum + row.price, 0)
      )
    );

    doc.y = statsY + 72;
    const panelWidth = (contentWidth - 12) / 2;
    const panelHeight = drawSummaryPanel(
      doc,
      PAGE.margin,
      doc.y,
      panelWidth,
      "Payment Summary",
      [
        { label: "Paid", value: `${summary.paidCount} requests` },
        { label: "Due", value: `${summary.dueCount} requests` },
        { label: "Partial", value: `${summary.partialCount} requests` },
      ]
    );
    drawSummaryPanel(
      doc,
      PAGE.margin + panelWidth + 12,
      doc.y,
      panelWidth,
      "Send Summary",
      [
        { label: "Pending", value: String(summary.sendPending) },
        { label: "Done", value: String(summary.sendDone) },
        { label: "Cancelled", value: String(summary.sendCancel) },
      ]
    );
    doc.y += panelHeight + 20;

    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(12);
    doc.text(`Detailed Records (${report.rows.length})`, PAGE.margin, doc.y);
    doc.moveDown(0.6);

    if (report.rows.length === 0) {
      doc.fillColor(COLORS.slate).font("Helvetica").fontSize(10);
      doc.text("No coin requests match the selected filters.", PAGE.margin, doc.y);
    } else {
      let tableY = drawTableHeader(doc, doc.y);
      const bottomLimit = PAGE.height - 56;

      report.rows.forEach((row, index) => {
        if (tableY + 22 > bottomLimit) {
          drawFooter(doc);
          doc.addPage();
          pageNumber += 1;
          drawHeader(doc, pageNumber);
          doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(12);
          doc.text("Detailed Records (continued)", PAGE.margin, doc.y);
          doc.moveDown(0.6);
          tableY = drawTableHeader(doc, doc.y);
        }
        tableY = drawTableRow(doc, tableY, row, index % 2 === 1);
      });
      doc.y = tableY + 8;
    }

    drawFooter(doc);
    doc.end();
  });
}
