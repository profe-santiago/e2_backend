import PDFDocument from "pdfkit";
import { Response } from "express";

export interface ConstanciaPayload {
  proyecto: any;
  textoLogro: string;
  nombreTitular: string;
  mostrarIntegrantes: boolean;
  evento: any;
}

export class PdfService {
  static generarConstancia(res: Response, payload: ConstanciaPayload) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Constancia_${payload.nombreTitular.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
    );
    doc.pipe(res);

    const isWinner = payload.textoLogro.includes("LUGAR");
    const title = isWinner ? "CONSTANCIA DE LOGRO" : "CONSTANCIA DE PARTICIPACIÓN";
    const subtitle1 = isWinner ? "Se otorga el presente reconocimiento al equipo:" : "Se otorga el presente documento al equipo:";

    // ─── Borde decorativo ───
    doc
      .rect(30, 20, doc.page.width - 60, doc.page.height - 40)
      .lineWidth(3)
      .strokeColor("#1a237e")
      .stroke();

    doc
      .rect(40, 30, doc.page.width - 80, doc.page.height - 60)
      .lineWidth(1)
      .strokeColor("#cbd5e1")
      .stroke();

    // ─── Encabezado ───
    doc.moveDown(1.5);
    doc
      .fontSize(12)
      .fillColor("#64748b")
      .font("Helvetica")
      .text("SISTEMA DE GESTIÓN DE PROYECTOS", { align: "center", characterSpacing: 2 });
    
    doc.moveDown(1.5);
    doc
      .fontSize(36)
      .fillColor("#0f172a")
      .font("Times-Bold")
      .text(title, { align: "center" });

    doc.moveDown(0.8);
    doc
      .fontSize(14)
      .fillColor("#64748b")
      .font("Helvetica")
      .text(subtitle1, { align: "center" });

    // ─── Recipient ───
    doc.moveDown(0.8);
    doc
      .fontSize(22)
      .fillColor("#1e293b")
      .font("Helvetica-Bold")
      .text(payload.nombreTitular, { align: "center" });

    // ─── Integrantes ───
    if (payload.mostrarIntegrantes && payload.proyecto.equipo?.miembros) {
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#64748b").font("Helvetica").text(isWinner ? "Y a sus integrantes:" : "Integrantes:", { align: "center" });
      const integrantes = payload.proyecto.equipo.miembros.map((m: any) => m.user?.name || `Miembro #${m.id}`).join(", ");
      doc.fontSize(10).fillColor("#475569").font("Helvetica-Oblique").text(integrantes, { align: "center" });
    }

    // ─── Award / Achievement ───
    doc.moveDown(1.2);
    if (isWinner) {
      doc.fontSize(13).fillColor("#64748b").font("Helvetica").text("Por haber obtenido el:", { align: "center" });
      
      let colorLogro = "#ca8a04"; // Gold
      if (payload.textoLogro.includes("SEGUNDO")) colorLogro = "#64748b";
      else if (payload.textoLogro.includes("TERCER")) colorLogro = "#b45309";

      doc.moveDown(0.5);
      doc
        .fontSize(28)
        .fillColor(colorLogro)
        .font("Helvetica-Bold")
        .text(payload.textoLogro, { align: "center", characterSpacing: 1 });
      
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#64748b").font("Helvetica").text(`Con el proyecto "${payload.proyecto.nombre}" en el evento:`, { align: "center" });
    } else {
      doc.fontSize(12).fillColor("#64748b").font("Helvetica").text(`Por su participación con el proyecto "${payload.proyecto.nombre}" en el evento:`, { align: "center" });
    }

    // ─── Event ───
    doc.moveDown(0.8);
    doc
      .fontSize(20)
      .fillColor("#4f46e5")
      .font("Helvetica-Bold")
      .text(payload.evento.nombre, { align: "center" });

    // ─── Footer Signatures ───
    const footerY = doc.page.height - 110;
    
    // Fecha
    const fecha = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    doc.fontSize(10).fillColor("#94a3b8").font("Helvetica-Bold").text(`Expedido el ${fecha}`, 60, footerY - 35, { align: "center", width: doc.page.width - 120 });

    // Lines
    const leftX = 120;
    const rightX = doc.page.width - 120 - 250;
    
    doc.lineWidth(1.5).strokeColor("#334155");
    
    // Left Sig
    doc.moveTo(leftX, footerY).lineTo(leftX + 250, footerY).stroke();
    doc.fontSize(12).fillColor("#1e293b").font("Helvetica-Bold").text("Director del Evento", leftX, footerY + 10, { width: 250, align: "center" });

    // Right Sig
    doc.moveTo(rightX, footerY).lineTo(rightX + 250, footerY).stroke();
    doc.fontSize(12).fillColor("#1e293b").font("Helvetica-Bold").text("Comité Evaluador", rightX, footerY + 10, { width: 250, align: "center" });

    doc.end();
  }

  static generarReporteDashboard(
    res: Response,
    data: any,
    userName: string = "Admin",
  ) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Reporte_Dashboard_${new Date().toISOString().split("T")[0]}.pdf"`,
    );
    doc.pipe(res);

    const pageWidth = doc.page.width - 100;

    // Header
    doc.fontSize(24).fillColor("#4f46e5").font("Helvetica-Bold");
    doc.text("REPORTE GENERAL DE ACTIVIDAD", { align: "center" });
    doc.moveDown(0.2);

    const tzOffset = -6 * 60; // Assuming -06:00
    const now = new Date(new Date().getTime() + tzOffset * 60 * 1000);
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);

    doc.fontSize(12).fillColor("#666").font("Helvetica");
    doc.text(`Generado el: ${dateStr} | Usuario: ${userName}`, {
      align: "center",
    });

    // Header border
    doc.moveDown(1);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .lineWidth(2)
      .strokeColor("#4f46e5")
      .stroke();
    doc.moveDown(1.5);

    // Resumen General
    doc
      .fontSize(16)
      .fillColor("#1f2937")
      .font("Helvetica-Bold")
      .text("Resumen General");
    doc.moveDown(0.2);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .lineWidth(1)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(0.5);

    // 4 Boxes
    const boxWidth = pageWidth / 4;
    const startY = doc.y;
    const boxHeight = 55;

    const stats = [
      { label: "JUECES REGISTRADOS", value: data.total_jueces || 0 },
      { label: "PARTICIPANTES", value: data.total_participantes || 0 },
      { label: "EQUIPOS", value: data.total_equipos || 0 },
      { label: "PROYECTOS", value: data.total_proyectos || 0 },
    ];

    stats.forEach((stat, i) => {
      const x = 50 + i * boxWidth;
      doc
        .rect(x, startY, boxWidth, boxHeight)
        .fillAndStroke("#f9fafb", "#e5e7eb");
      doc
        .fillColor("#111827")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text(stat.value.toString(), x, startY + 12, {
          width: boxWidth,
          align: "center",
        });
      doc
        .fillColor("#6b7280")
        .font("Helvetica")
        .fontSize(8)
        .text(stat.label, x, startY + 38, { width: boxWidth, align: "center" });
    });

    doc.y = startY + boxHeight + 30;

    // Estado de Proyectos
    doc
      .fontSize(16)
      .fillColor("#1f2937")
      .font("Helvetica-Bold")
      .text("Estado de Proyectos");
    doc.moveDown(0.2);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .lineWidth(1)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(0.5);

    // Table
    const colStatus = 50,
      colCant = 150,
      colPorc = 250,
      colVis = 350;
    const drawRow = (
      y: number,
      isHeader: boolean,
      status: string,
      cant: string,
      porc: string,
      fillPercent?: number,
      color?: string,
    ) => {
      doc
        .rect(50, y, pageWidth, 25)
        .fillAndStroke(isHeader ? "#f3f4f6" : "#ffffff", "#e5e7eb");
      doc
        .fillColor(isHeader ? "#111827" : "#333")
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10);
      doc.text(status, colStatus + 10, y + 8);
      doc.text(cant, colCant + 10, y + 8);
      doc.text(porc, colPorc + 10, y + 8);
      if (!isHeader && fillPercent !== undefined) {
        doc.rect(colVis + 10, y + 8, 100, 10).fill("#e5e7eb"); // track
        if (fillPercent > 0) {
          doc
            .rect(colVis + 10, y + 8, fillPercent, 10)
            .fill(color || "#4f46e5"); // fill
        }
      } else if (isHeader) {
        doc.text("Visualización", colVis + 10, y + 8);
      }
    };

    let tblY = doc.y;
    drawRow(tblY, true, "Estado", "Cantidad", "Porcentaje");
    tblY += 25;

    const evs = data.proyectosEvaluados || 0;
    const pends = data.proyectosPendientes || 0;
    const totalP = evs + pends;

    const evsPct = totalP > 0 ? (evs / totalP) * 100 : 0;
    const pendsPct = totalP > 0 ? (pends / totalP) * 100 : 0;

    drawRow(
      tblY,
      false,
      "Evaluados",
      evs.toString(),
      `${evsPct.toFixed(1)}%`,
      evsPct,
      "#4f46e5",
    );
    tblY += 25;
    drawRow(
      tblY,
      false,
      "Pendientes",
      pends.toString(),
      `${pendsPct.toFixed(1)}%`,
      pendsPct,
      "#9ca3af",
    );

    doc.y = tblY + 30;

    // Participación por Carrera
    doc
      .fontSize(16)
      .fillColor("#1f2937")
      .font("Helvetica-Bold")
      .text("Participación por Carrera");
    doc.moveDown(0.2);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .lineWidth(1)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(0.5);

    let cy = doc.y;
    doc.rect(50, cy, pageWidth, 25).fillAndStroke("#f3f4f6", "#e5e7eb");
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10);
    doc.text("Carrera", 60, cy + 8);
    doc.text("Participantes", 300, cy + 8);
    cy += 25;

    if (
      data.participantesPorCarrera &&
      Object.keys(data.participantesPorCarrera).length > 0
    ) {
      Object.entries(data.participantesPorCarrera).forEach(
        ([carrera, total]) => {
          if (cy > doc.page.height - 100) {
            doc.addPage();
            cy = 50;
          }
          doc.rect(50, cy, pageWidth, 25).fillAndStroke("#ffffff", "#e5e7eb");
          doc.fillColor("#333").font("Helvetica").fontSize(10);
          doc.text(carrera, 60, cy + 8, { width: 230, ellipsis: true });
          doc.text(total?.toString() || "0", 300, cy + 8);
          cy += 25;
        },
      );
    } else {
      doc.rect(50, cy, pageWidth, 25).fillAndStroke("#ffffff", "#e5e7eb");
      doc.fillColor("#666").font("Helvetica-Oblique").fontSize(10);
      doc.text("No hay datos disponibles.", 60, cy + 8);
      cy += 25;
    }

    doc.y = cy + 30;

    // Próximos Eventos
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
      doc.y = 50;
    }
    doc
      .fontSize(16)
      .fillColor("#1f2937")
      .font("Helvetica-Bold")
      .text("Próximos Eventos");
    doc.moveDown(0.2);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .lineWidth(1)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(0.5);

    let cye = doc.y;
    if (data.eventos_activos && data.eventos_activos.length > 0) {
      doc.rect(50, cye, pageWidth, 25).fillAndStroke("#f3f4f6", "#e5e7eb");
      doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10);
      doc.text("Evento", 60, cye + 8);
      doc.text("Fecha Inicio", 200, cye + 8);
      doc.text("Descripción", 300, cye + 8);
      cye += 25;

      data.eventos_activos.forEach((evento: any) => {
        if (cye > doc.page.height - 50) {
          doc.addPage();
          cye = 50;
        }

        const descText = evento.descripcion || "Sin descripción";
        doc.fontSize(9);
        const descHeight = doc.heightOfString(descText, {
          width: pageWidth - 260,
        });
        const rowHeight = Math.max(25, descHeight + 10);

        doc
          .rect(50, cye, pageWidth, rowHeight)
          .fillAndStroke("#ffffff", "#e5e7eb");
        doc.fillColor("#333").font("Helvetica").fontSize(10);
        doc.text(evento.nombre, 60, cye + 8, {
          width: 130,
          height: 15,
          ellipsis: true,
        });
        doc.text(
          new Date(evento.fecha_inicio).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          200,
          cye + 8,
        );
        doc
          .fontSize(9)
          .fillColor("#666")
          .text(descText, 300, cye + 8, { width: pageWidth - 260 });
        cye += rowHeight;
      });
    } else {
      doc
        .fillColor("#666")
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text("No hay eventos programados próximamente.");
    }

    doc.end();
  }

  static generarReporteGlobalEventos(
    res: Response,
    ranking: any[],
    evento: any,
  ) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Resultados_${evento.nombre.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
    );
    doc.pipe(res);

    doc
      .fontSize(20)
      .fillColor("#1a237e")
      .font("Helvetica-Bold")
      .text("Resultados del Evento", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .fillColor("#e65100")
      .font("Helvetica-Bold")
      .text(evento.nombre, { align: "center" });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(`Reporte emitido el: ${new Date().toLocaleDateString("es-MX")}`, {
        align: "center",
      });

    doc.moveDown(2);

    if (ranking.length === 0) {
      doc
        .fontSize(12)
        .fillColor("#333")
        .text("No se encontraron proyectos en este evento.", {
          align: "center",
        });
    } else {
      ranking.forEach((r, idx) => {
        doc
          .fontSize(12)
          .fillColor("#333")
          .font("Helvetica-Bold")
          .text(`${idx + 1}. ${r.proyecto.nombre}`);
        doc
          .fontSize(10)
          .fillColor("#555")
          .font("Helvetica")
          .text(`Equipo: ${r.proyecto.equipo || "Sin Equipo"}`);
        doc.text(`Puntaje Final: ${Number(r.puntaje_total).toFixed(2)}`);
        doc.moveDown(1);
      });
    }

    doc.end();
  }

  static generarReporteUsuarios(res: Response, usuarios: any[]) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    const primaryColor = "#4f46e5";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Reporte_Usuarios_${new Date().toISOString().split("T")[0]}.pdf"`,
    );
    doc.pipe(res);

    // Header
    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("REPORTE DE USUARIOS", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(`Generado el: ${new Date().toLocaleString("es-MX")}`, {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .lineWidth(2)
      .strokeColor(primaryColor)
      .stroke();
    doc.moveDown(1);

    // Table Header
    const yHeader = doc.y;
    doc.rect(40, yHeader, 515, 20).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("ID", 45, yHeader + 6);
    doc.text("Nombre", 80, yHeader + 6);
    doc.text("Email", 220, yHeader + 6);
    doc.text("Rol", 380, yHeader + 6);
    doc.text("Fecha Reg.", 480, yHeader + 6);
    doc.y = yHeader + 20;

    // Rows
    usuarios.forEach((u, i) => {
      const y = doc.y;
      if (y > 750) {
        doc.addPage();
        doc.y = 40;
      }
      const currentY = doc.y;
      if (i % 2 === 1) doc.rect(40, currentY, 515, 20).fill("#f9fafb");

      doc.fillColor("#333").font("Helvetica").fontSize(8);
      doc.text(u.id.toString(), 45, currentY + 6);
      doc.text(u.name || "N/A", 80, currentY + 6, {
        width: 130,
        ellipsis: true,
      });
      doc.text(u.email || "N/A", 220, currentY + 6, {
        width: 150,
        ellipsis: true,
      });
      doc.text(u.role || "PARTICIPANTE", 380, currentY + 6);
      doc.text(
        new Date(u.created_at).toLocaleDateString("es-MX"),
        480,
        currentY + 6,
      );

      doc
        .moveTo(40, currentY + 20)
        .lineTo(555, currentY + 20)
        .lineWidth(0.5)
        .strokeColor("#e5e7eb")
        .stroke();
      doc.y = currentY + 20;
    });

    doc.end();
  }

  static generarReporteEquipos(res: Response, equipos: any[]) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    const primaryColor = "#3b82f6";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Reporte_Equipos_${new Date().toISOString().split("T")[0]}.pdf"`,
    );
    doc.pipe(res);

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("REPORTE DE EQUIPOS", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(`Generado el: ${new Date().toLocaleString("es-MX")}`, {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .lineWidth(2)
      .strokeColor(primaryColor)
      .stroke();
    doc.moveDown(1);

    const yHeader = doc.y;
    doc.rect(40, yHeader, 515, 20).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("Equipo", 45, yHeader + 6);
    doc.text("Evento", 180, yHeader + 6);
    doc.text("Proyecto", 320, yHeader + 6);
    doc.text("Integrantes", 440, yHeader + 6);
    doc.y = yHeader + 20;

    equipos.forEach((e, i) => {
      const y = doc.y;
      if (y > 750) {
        doc.addPage();
        doc.y = 40;
      }
      const currentY = doc.y;
      if (i % 2 === 1) doc.rect(40, currentY, 515, 20).fill("#f9fafb");

      doc.fillColor("#333").font("Helvetica").fontSize(8);
      doc.text(e.nombre || "N/A", 45, currentY + 6, {
        width: 130,
        ellipsis: true,
      });
      doc.text(e.proyecto?.eventos?.nombre || "N/A", 180, currentY + 6, {
        width: 130,
        ellipsis: true,
      });
      doc.text(e.proyecto?.nombre || "Sin proyecto", 320, currentY + 6, {
        width: 110,
        ellipsis: true,
      });
      doc.text(e.miembros?.length.toString() || "0", 440, currentY + 6);

      doc
        .moveTo(40, currentY + 20)
        .lineTo(555, currentY + 20)
        .lineWidth(0.5)
        .strokeColor("#e5e7eb")
        .stroke();
      doc.y = currentY + 20;
    });

    doc.end();
  }

  static generarReporteEventos(res: Response, eventos: any[]) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    const primaryColor = "#9333ea";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Reporte_Eventos_${new Date().toISOString().split("T")[0]}.pdf"`,
    );
    doc.pipe(res);

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("REPORTE DE EVENTOS", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(`Generado el: ${new Date().toLocaleString("es-MX")}`, {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .lineWidth(2)
      .strokeColor(primaryColor)
      .stroke();
    doc.moveDown(1);

    const yHeader = doc.y;
    doc.rect(40, yHeader, 515, 20).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("Evento", 45, yHeader + 6);
    doc.text("Inicio", 200, yHeader + 6);
    doc.text("Fin", 300, yHeader + 6);
    doc.text("Proyectos", 400, yHeader + 6);
    doc.text("Estado", 480, yHeader + 6);
    doc.y = yHeader + 20;

    eventos.forEach((e, i) => {
      const y = doc.y;
      if (y > 750) {
        doc.addPage();
        doc.y = 40;
      }
      const currentY = doc.y;
      if (i % 2 === 1) doc.rect(40, currentY, 515, 20).fill("#f9fafb");

      const isPast = new Date(e.fecha_fin) < new Date();
      doc.fillColor("#333").font("Helvetica").fontSize(8);
      doc.text(e.nombre || "N/A", 45, currentY + 6, {
        width: 150,
        ellipsis: true,
      });
      doc.text(
        new Date(e.fecha_inicio).toLocaleDateString("es-MX"),
        200,
        currentY + 6,
      );
      doc.text(
        new Date(e.fecha_fin).toLocaleDateString("es-MX"),
        300,
        currentY + 6,
      );
      doc.text(e.proyectos?.length.toString() || "0", 400, currentY + 6);
      doc.text(isPast ? "FINALIZADO" : "ACTIVO", 480, currentY + 6);

      doc
        .moveTo(40, currentY + 20)
        .lineTo(555, currentY + 20)
        .lineWidth(0.5)
        .strokeColor("#e5e7eb")
        .stroke();
      doc.y = currentY + 20;
    });

    doc.end();
  }

  static generarReporteProyectos(res: Response, proyectos: any[]) {
    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    const primaryColor = "#10b981";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Reporte_Proyectos_${new Date().toISOString().split("T")[0]}.pdf"`,
    );
    doc.pipe(res);

    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("REPORTE DE PROYECTOS", { align: "center" });
    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(`Generado el: ${new Date().toLocaleString("es-MX")}`, {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .lineWidth(2)
      .strokeColor(primaryColor)
      .stroke();
    doc.moveDown(1);

    const yHeader = doc.y;
    doc.rect(40, yHeader, 515, 20).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("Proyecto", 45, yHeader + 6);
    doc.text("Equipo", 200, yHeader + 6);
    doc.text("Evento", 350, yHeader + 6);
    doc.text("Calificación", 480, yHeader + 6);
    doc.y = yHeader + 20;

    proyectos.forEach((p, i) => {
      const y = doc.y;
      if (y > 750) {
        doc.addPage();
        doc.y = 40;
      }
      const currentY = doc.y;
      if (i % 2 === 1) doc.rect(40, currentY, 515, 20).fill("#f9fafb");

      doc.fillColor("#333").font("Helvetica").fontSize(8);
      doc.text(p.nombre || "N/A", 45, currentY + 6, {
        width: 150,
        ellipsis: true,
      });
      doc.text(p.equipo?.nombre || "Sin Equipo", 200, currentY + 6, {
        width: 140,
        ellipsis: true,
      });
      doc.text(p.evento?.nombre || "N/A", 350, currentY + 6, {
        width: 120,
        ellipsis: true,
      });
      doc.text("Pendiente", 480, currentY + 6);

      doc
        .moveTo(40, currentY + 20)
        .lineTo(555, currentY + 20)
        .lineWidth(0.5)
        .strokeColor("#e5e7eb")
        .stroke();
      doc.y = currentY + 20;
    });

    doc.end();
  }
}
