// src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LOGO_PATH = "/mafacture_logo_blanc_transparent.png";

export const generateFacturePDF = (facture, client) => {
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.onload = () => buildFacturePDF(facture, client, logo);
  logo.onerror = () => buildFacturePDF(facture, client, null);
  logo.src = LOGO_PATH;
};

const buildFacturePDF = (facture, client, logo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const darkGreen = [1, 48, 35];
  const green = [22, 101, 52];
  const lightGreen = [236, 253, 245];
  const text = [17, 24, 39];
  const muted = [75, 85, 99];
  const line = [209, 213, 219];

  drawHeader(doc, facture, logo, pageWidth, margin, darkGreen);
  drawBillingBlocks(doc, facture, client, pageWidth, margin, text, muted, lightGreen);

  const rows = (facture.articles || []).map((article) => [
    article.designation || "Projet",
    formatMoney(article.prix_unitaire),
    article.quantite || 1,
    formatMoney(article.total_ht_ligne || Number(article.quantite || 1) * Number(article.prix_unitaire || 0)),
  ]);

  autoTable(doc, {
    startY: 112,
    margin: { left: margin, right: margin },
    head: [["Description", "Prix unitaire", "Qte", "Total"]],
    body: rows.length ? rows : [["Projet", formatMoney(0), 1, formatMoney(0)]],
    headStyles: {
      fillColor: darkGreen,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: text,
      lineColor: line,
      lineWidth: 0.1,
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 82, fontStyle: "bold", halign: "left" },
      1: { halign: "right" },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "right" },
    },
  });

  let y = doc.lastAutoTable.finalY + 12;
  if (y > 210) {
    doc.addPage();
    y = 24;
  }

  drawNotes(doc, facture, margin, y, text, muted, green);
  drawTotals(doc, facture, pageWidth, y, darkGreen, text, muted);
  drawFooter(doc, pageWidth, pageHeight, margin, darkGreen, green, text, muted, line);

  doc.save(`${facture.numero || "facture"}.pdf`);
};

const drawHeader = (doc, facture, logo, pageWidth, margin, darkGreen) => {
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, pageWidth, 54, "F");

  if (logo) {
    doc.addImage(logo, "PNG", margin, 12, 58, 22);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("MaFacture", margin, 25);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setTextColor(255, 255, 255);
  doc.text("FACTURE", pageWidth - margin, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(facture.numero || "FAC-0001", pageWidth - margin, 29, { align: "right" });
  doc.text(`Date: ${formatDate(facture.date_creation)}`, pageWidth - margin, 36, { align: "right" });
  if (facture.date_depot) {
    doc.text(`Depot: ${formatDate(facture.date_depot)}`, pageWidth - margin, 43, { align: "right" });
  }
};

const drawBillingBlocks = (doc, facture, client, pageWidth, margin, text, muted, lightGreen) => {
  const gap = 6;
  const blockY = 64;
  const blockH = 34;
  const blockW = (pageWidth - margin * 2 - gap * 2) / 3;
  const detailsX = margin + blockW + gap;
  const clientX = margin + (blockW + gap) * 2;
  const blocks = [margin, detailsX, clientX];

  blocks.forEach((x) => {
    doc.setFillColor(...lightGreen);
    doc.rect(x, blockY, blockW, blockH, "F");
  });

  drawBlockTitle(doc, "DE", margin + 4, blockY + 8, text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...text);
  doc.text("MaFacture", margin + 4, blockY + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.7);
  doc.setTextColor(...muted);
  doc.text("Gestion et facturation professionnelle", margin + 4, blockY + 22);
  doc.text("contact@mafacture.com", margin + 4, blockY + 27);
  doc.text("+212 6 00 00 00 00", margin + 4, blockY + 32);

  drawBlockTitle(doc, "DETAILS", detailsX + 4, blockY + 8, text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...muted);
  const details = [
    ["Statut", translateStatut(facture.statut)],
    ["Methode", translateMethode(facture.methode_facturation)],
  ];
  if (facture.type_virement) details.push(["Virement", facture.type_virement]);
  details.forEach(([label, value], index) => {
    const rowY = blockY + 16 + index * 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...text);
    doc.text(`${label}:`, detailsX + 4, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(trimText(doc, value, blockW - 25), detailsX + 24, rowY);
  });

  drawBlockTitle(doc, "A", clientX + 4, blockY + 8, text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...text);
  doc.text(client?.nom || "Client", clientX + 4, blockY + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...muted);
  if (client?.tel) doc.text(client.tel, clientX + 4, blockY + 23);
  if (client?.adresse) doc.text(trimText(doc, client.adresse, blockW - 8), clientX + 4, blockY + 30);
};

const drawBlockTitle = (doc, title, x, y, text) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...text);
  doc.text(title, x, y);
};

const drawNotes = (doc, facture, margin, y, text, muted, green) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...green);
  doc.text("Note:", margin, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  const note = facture.description || "Merci pour votre confiance.";
  doc.text(doc.splitTextToSize(note, 72), margin, y + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...text);
  doc.text("Merci pour votre business", margin, y + 46);
};

const drawTotals = (doc, facture, pageWidth, y, darkGreen, text, muted) => {
  const x = pageWidth - 76;
  const amountX = pageWidth - 16;
  const totalHt = Number(facture.total_ht || 0);
  const remise = Number(facture.montant_remise || 0);
  const tva = Number(facture.tva || 0);
  const totalTtc = Number(facture.total_ttc || totalHt - remise + tva);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);

  doc.text("SUBTOTAL :", x, y + 7);
  doc.text(formatMoney(totalHt), amountX, y + 7, { align: "right" });

  doc.text("TVA :", x, y + 17);
  doc.text(formatMoney(tva), amountX, y + 17, { align: "right" });

  doc.text("REMISE :", x, y + 27);
  doc.text(formatMoney(remise), amountX, y + 27, { align: "right" });

  doc.setFillColor(...darkGreen);
  doc.rect(x - 4, y + 36, 64, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("TOTAL TTC :", x, y + 48);
  doc.text(formatMoney(totalTtc), amountX - 2, y + 48, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...text);
  doc.text("Signature & Cachet", x, y + 68);
  doc.rect(x, y + 72, 60, 18);
  if (facture.digital_signature_enabled) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...darkGreen);
    doc.text("Signature numerique", x + 4, y + 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...muted);
    doc.text(
      trimText(doc, facture.digital_signature_text || "Signe numeriquement par MaFacture", 52),
      x + 4,
      y + 86,
    );
  }
};

const drawFooter = (doc, pageWidth, pageHeight, margin, darkGreen, green, text, muted, line) => {
  const y = pageHeight - 38;
  doc.setDrawColor(...line);
  doc.line(margin, y - 6, pageWidth - margin, y - 6);

  const colWidth = (pageWidth - margin * 2) / 3;
  const columns = [
    ["Questions?", "Email us: contact@mafacture.com", "Call us: +212 6 00 00 00 00"],
    ["Payment Info:", "Account: 123 456 789", "Bank Detail: Banque"],
    ["Terms & Conditions/Note:", "Paiement selon les conditions", "convenues avec le client."],
  ];

  columns.forEach((column, index) => {
    const x = margin + colWidth * index;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...(index === 1 ? darkGreen : green));
    doc.text(column[0], x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...muted);
    doc.text(column[1], x, y + 8);
    doc.text(column[2], x, y + 14);
  });
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EUR`;

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR");
  } catch {
    return dateStr;
  }
};

const trimText = (doc, value, maxWidth) => {
  const lines = doc.splitTextToSize(value, maxWidth);
  return lines[0] || value;
};

const translateStatut = (statut) => {
  const map = { en_attente: "En attente", payee: "Payee", rejetee: "Rejetee" };
  return map[statut] || statut || "N/A";
};

const translateMethode = (method) => {
  const map = {
    ht_tva: "HT + TVA",
    remise_ligne: "Remise par ligne",
    remise_globale: "Remise globale",
    tva_categorie: "TVA par categorie",
  };
  return map[method] || method || "Standard";
};
