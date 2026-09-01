import type { CoinRequest, CoinRequestReport } from "@/types";
import { formatDateRangeLabel } from "@/lib/utils/date-range";
import { formatCoinAmount, formatPricePerLac } from "@/lib/utils/coin-amount";
import PDFDocument from "pdfkit";

const COLORS = {
  navy: "#0f172a",
  gold: "#f59e0b",
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
  contentBottom: 788,
};

const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

type PDFDoc = InstanceType<typeof PDFDocument>;

interface TableColumn {
  label: string;
  width: number;
  align?: "left" | "right" | "center";
}

const TABLE_COLUMNS: TableColumn[] = [
  { label: "ID", width: 100 },
  { label: "Requested By", width: 68 },
  { label: "Price", width: 48, align: "right" },
  { label: "Coins", width: 42, align: "right" },
  { label: "Price/lac", width: 46, align: "right" },
  { label: "Payment", width: 44 },
  { label: "Send", width: 36 },
  { label: "Method", width: 44 },
  { label: "Created", width: 83 },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatReportDateTime(date: string): string {
  const d = new Date(date);
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  }).format(d);
  const timePart = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${datePart} ${timePart}`;
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
  return `${text.slice(0, max - 3)}...`;
}

function pdfSafeCoinAmount(value: number): string {
  const formatted = formatCoinAmount(value);
  return formatted === "\u2014" ? "-" : formatted;
}

function buildFilterLines(report: CoinRequestReport): string[] {
  const lines: string[] = [];
  const range = formatDateRangeLabel(
    report.filters.dateFrom,
    report.filters.dateTo
  );
  if (range) {
    lines.push(`Period: ${range.replace(/\u2013/g, "-")}`);
  }
  if (report.filters.requestId) {
    lines.push(`Request ID: ${report.filters.requestId}`);
  }
  if (report.filters.whoRequested) {
    lines.push(`Requested by: ${report.filters.whoRequested}`);
  }
  if (lines.length === 0) lines.push("Period: All records");
  return lines;
}

function drawHeader(doc: PDFDoc, pageNumber: number) {
  doc.save();
  doc.rect(0, 0, PAGE.width, 88).fill(COLORS.navy);
  doc.rect(0, 84, PAGE.width, 4).fill(COLORS.gold);

  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(20);
  doc.text("Coin Requests", PAGE.margin, 28, {
    width: CONTENT_WIDTH,
    lineBreak: false,
  });

  doc.fillColor(COLORS.slateLight).font("Helvetica").fontSize(10);
  doc.text("MANAGEMENT REPORT", PAGE.margin, 52, { lineBreak: false });

  doc.fillColor(COLORS.white).font("Helvetica").fontSize(9);
  doc.text(`Page ${pageNumber}`, PAGE.margin, 28, {
    width: CONTENT_WIDTH,
    align: "right",
    lineBreak: false,
  });
  doc.restore();
}

function drawFooterOnPage(doc: PDFDoc) {
  const footerY = PAGE.height - 36;
  const left = `Generated ${formatReportDateTime(new Date().toISOString())} | Coin Requests System`;
  const previousBottom = doc.page.margins.bottom;

  doc.page.margins.bottom = 0;
  doc.x = PAGE.margin;
  doc.y = footerY;

  doc.strokeColor(COLORS.border).lineWidth(1);
  doc
    .moveTo(PAGE.margin, footerY - 8)
    .lineTo(PAGE.margin + CONTENT_WIDTH, footerY - 8)
    .stroke();

  doc.fillColor(COLORS.slate).font("Helvetica").fontSize(8);
  doc.text(left, PAGE.margin, footerY, {
    width: CONTENT_WIDTH - 72,
    lineBreak: false,
    height: 10,
  });
  doc.text("Confidential", PAGE.margin + CONTENT_WIDTH - 72, footerY, {
    width: 72,
    align: "right",
    lineBreak: false,
    height: 10,
  });

  doc.page.margins.bottom = previousBottom;
  doc.x = PAGE.margin;
  doc.y = PAGE.margin;
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
  doc.text(label.toUpperCase(), x + 12, y + 12, {
    width: width - 24,
    lineBreak: false,
  });
  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(14);
  doc.text(value, x + 12, y + 30, {
    width: width - 24,
    lineBreak: false,
  });
  doc.restore();
}

function drawSummaryPanel(
  doc: PDFDoc,
  x: number,
  y: number,
  width: number,
  title: string,
  rows: { label: string; value: string }[]
): number {
  const height = 34 + rows.length * 22;

  doc.save();
  doc.roundedRect(x, y, width, height, 6).stroke(COLORS.border);
  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(10);
  doc.text(title, x + 14, y + 12, { lineBreak: false });

  let rowY = y + 30;
  rows.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.save();
      doc.fillColor(COLORS.rowAlt);
      doc.rect(x + 1, rowY - 2, width - 2, 20).fill();
      doc.restore();
    }
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9);
    doc.text(row.label, x + 14, rowY, {
      width: width / 2 - 14,
      lineBreak: false,
    });
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(9);
    doc.text(row.value, x + width / 2, rowY, {
      width: width / 2 - 14,
      align: "right",
      lineBreak: false,
    });
    rowY += 22;
  });
  doc.restore();

  return height;
}

function drawTableHeader(doc: PDFDoc, y: number): number {
  let x = PAGE.margin;

  doc.save();
  doc.rect(PAGE.margin, y, CONTENT_WIDTH, 24).fill(COLORS.navy);
  TABLE_COLUMNS.forEach((col) => {
    doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(8);
    doc.text(col.label, x + 6, y + 8, {
      width: col.width - 12,
      align: col.align ?? "left",
      lineBreak: false,
    });
    x += col.width;
  });
  doc.restore();
  doc.font("Helvetica").fontSize(8);

  return y + 24;
}

function getTableRowValues(row: CoinRequest): string[] {
  return [
    row.request_id,
    truncate(row.who_requested, 20),
    formatCurrency(row.price),
    pdfSafeCoinAmount(row.coin_amount),
    formatPricePerLac(row.price, row.coin_amount),
    capitalize(row.payment_status),
    capitalize(row.send_status),
    truncate(formatPaymentMethod(row.payment_method, row.payment_method_other), 12),
    formatReportDateTime(row.created_at),
  ];
}

function measureTableRowHeight(doc: PDFDoc, values: string[]): number {
  doc.font("Helvetica").fontSize(8);
  let maxHeight = 16;
  values.forEach((value, index) => {
    const col = TABLE_COLUMNS[index];
    const height = doc.heightOfString(value, {
      width: col.width - 12,
    });
    maxHeight = Math.max(maxHeight, height);
  });
  return maxHeight + 10;
}

function drawTableRow(
  doc: PDFDoc,
  y: number,
  values: string[],
  alt: boolean
): number {
  const rowHeight = measureTableRowHeight(doc, values);

  if (alt) {
    doc.save();
    doc.fillColor(COLORS.rowAlt);
    doc.rect(PAGE.margin, y, CONTENT_WIDTH, rowHeight).fill();
    doc.restore();
  }

  let x = PAGE.margin;
  values.forEach((value, index) => {
    const col = TABLE_COLUMNS[index];
    doc.fillColor(COLORS.text).font("Helvetica").fontSize(8);
    doc.text(value, x + 6, y + 5, {
      width: col.width - 12,
      align: col.align ?? "left",
      lineBreak: false,
      height: rowHeight - 10,
    });
    x += col.width;
  });

  doc.x = PAGE.margin;
  doc.y = y + rowHeight;

  doc.save();
  doc.strokeColor(COLORS.border).lineWidth(0.5);
  doc
    .moveTo(PAGE.margin, y + rowHeight)
    .lineTo(PAGE.margin + CONTENT_WIDTH, y + rowHeight)
    .stroke();
  doc.restore();

  return y + rowHeight;
}

function startTablePage(
  doc: PDFDoc,
  pageNumber: number,
  continued: boolean
): { tableY: number; pageNumber: number } {
  doc.addPage();
  pageNumber += 1;
  drawHeader(doc, pageNumber);

  let y = 108;
  if (continued) {
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(12);
    doc.text("Detailed Records (continued)", PAGE.margin, y, { lineBreak: false });
    y += 22;
  }

  return {
    tableY: drawTableHeader(doc, y),
    pageNumber,
  };
}

export async function generateCoinRequestReportPdf(
  report: CoinRequestReport
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE.margin,
      bufferPages: true,
      autoFirstPage: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNumber = 1;
    drawHeader(doc, pageNumber);

    let y = 108;

    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(16);
    doc.text("Coin Request Report", PAGE.margin, y, { lineBreak: false });
    y += 24;

    doc.fillColor(COLORS.slate).font("Helvetica").fontSize(10);
    buildFilterLines(report).forEach((line) => {
      doc.text(line, PAGE.margin, y, { width: CONTENT_WIDTH, lineBreak: false });
      y += 14;
    });
    y += 12;

    const statWidth = (CONTENT_WIDTH - 18) / 4;
    const { summary } = report;
    drawStatBox(doc, PAGE.margin, y, statWidth, "Total Records", String(summary.totalRecords));
    drawStatBox(
      doc,
      PAGE.margin + statWidth + 6,
      y,
      statWidth,
      "Total Coins",
      pdfSafeCoinAmount(summary.totalCoins)
    );
    drawStatBox(
      doc,
      PAGE.margin + (statWidth + 6) * 2,
      y,
      statWidth,
      "Total Price",
      formatCurrency(summary.totalPrice)
    );
    drawStatBox(
      doc,
      PAGE.margin + (statWidth + 6) * 3,
      y,
      statWidth,
      "Outstanding",
      formatCurrency(
        report.rows
          .filter((row) => row.payment_status === "due" || row.payment_status === "partial")
          .reduce((sum, row) => sum + row.price, 0)
      )
    );
    y += 72;

    const panelWidth = (CONTENT_WIDTH - 12) / 2;
    const panelY = y;
    const panelHeight = drawSummaryPanel(doc, PAGE.margin, panelY, panelWidth, "Payment Summary", [
      { label: "Paid", value: `${summary.paidCount} requests` },
      { label: "Due", value: `${summary.dueCount} requests` },
      { label: "Partial", value: `${summary.partialCount} requests` },
    ]);
    drawSummaryPanel(doc, PAGE.margin + panelWidth + 12, panelY, panelWidth, "Send Summary", [
      { label: "Pending", value: String(summary.sendPending) },
      { label: "Done", value: String(summary.sendDone) },
      { label: "Cancelled", value: String(summary.sendCancel) },
    ]);
    y = panelY + panelHeight + 20;

    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(12);
    doc.text(`Detailed Records (${report.rows.length})`, PAGE.margin, y, {
      lineBreak: false,
    });
    y += 22;

    if (report.rows.length === 0) {
      doc.fillColor(COLORS.slate).font("Helvetica").fontSize(10);
      doc.text("No coin requests match the selected filters.", PAGE.margin, y, {
        lineBreak: false,
      });
    } else {
      let tableY = drawTableHeader(doc, y);

      report.rows.forEach((row, index) => {
        const values = getTableRowValues(row);
        const rowHeight = measureTableRowHeight(doc, values);

        if (tableY + rowHeight > PAGE.contentBottom) {
          const nextPage = startTablePage(doc, pageNumber, true);
          pageNumber = nextPage.pageNumber;
          tableY = nextPage.tableY;
        }

        tableY = drawTableRow(doc, tableY, values, index % 2 === 1);
      });
    }

    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i += 1) {
      doc.switchToPage(i);
      drawFooterOnPage(doc);
    }

    doc.end();
  });
}
