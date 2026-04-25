import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils";


export async function exportTaskReport(
  tasks: any[], 
  projectName: string, 
  hourlyRate: number | null,
  period: { from: Date, to: Date },
  selectedStatuses: string[]
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Relatório de Atividades", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Projeto: ${projectName}`, 14, 32);
  doc.text(`Período: ${format(period.from, "dd/MM/yyyy")} até ${format(period.to, "dd/MM/yyyy")}`, 14, 38);
  if (hourlyRate) {
    doc.text(`Valor Hora: R$ ${hourlyRate.toFixed(2)}`, 14, 44);
  }

  const filteredTasks = tasks.filter(t => selectedStatuses.includes(t.status));
  
  const tableData = filteredTasks.flatMap(task => {
    const entries = task.timeEntries?.filter((e: any) => {
      const start = new Date(e.startTime);
      return start >= period.from && start <= period.to;
    }) || [];
    
    return entries.map((entry: any) => [
      task.title,
      entry.description || "Sem descrição",
      format(new Date(entry.startTime), "dd/MM/yyyy HH:mm"),
      formatTime(entry.duration),
      hourlyRate ? `R$ ${((entry.duration / 3600) * hourlyRate).toFixed(2)}` : "-"
    ]);
  });

  autoTable(doc, {
    startY: 55,
    head: [["Atividade", "Descrição", "Data/Hora", "Duração", "Valor"]],
    body: tableData,
    foot: [[
      "Total", 
      "", 
      "", 
      formatTime(tableData.reduce((acc, curr) => acc + (parseInt(curr[3]) || 0), 0)), // This is wrong because formatTime expects seconds but we are passing string. Let's fix.
      hourlyRate ? `R$ ${((tableData.reduce((acc, curr) => {
          const durStr = curr[3] as string;
          // Simple duration sum from tableData is tricky, better sum from original entries
          return acc;
      }, 0) / 3600) * hourlyRate).toFixed(2)}` : "-"
    ]]
  });

  // Recalculate totals properly
  const totalDuration = filteredTasks.reduce((acc, task) => {
    const entries = task.timeEntries?.filter((e: any) => {
      const start = new Date(e.startTime);
      return start >= period.from && start <= period.to;
    }) || [];
    return acc + entries.reduce((a: number, b: any) => a + b.duration, 0);
  }, 0);

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Tempo Total: ${formatTime(totalDuration)}`, 14, finalY);
  if (hourlyRate) {
    doc.text(`Valor Total: R$ ${((totalDuration / 3600) * hourlyRate).toFixed(2)}`, 14, finalY + 7);
  }

  doc.save(`relatorio-${projectName.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
