"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

import { updateTaskStatus, toggleTimer, createTask, finalizeTimer, addManualTime, getTaskWithDetails, updateTask } from "@/app/actions";
import { Play, Pause, Plus, MoreHorizontal, Paperclip, Clock, Calendar, FileText, Download, CheckCircle2, History, X, GripVertical, Save, Edit2, ChevronLeft } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Button } from "@/src/components/atoms/button";
import { Badge } from "@/src/components/atoms/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/atoms/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/atoms/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/atoms/dialog";
import { Input } from "@/src/components/atoms/input";
import { Textarea } from "@/src/components/atoms/textarea";
import { Label } from "@/src/components/atoms/label";
import { format } from "date-fns";
import { exportTaskReport } from "@/src/lib/pdf-export";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


// --- Components ---

function ActiveTimer({ task, projectId }: { task: any, projectId: string }) {
  const [elapsed, setElapsed] = useState(task.accumulatedTime);
  const [showFinalize, setShowFinalize] = useState(false);
  
  useEffect(() => {
    if (!task.timerStartedAt) return;
    
    const startedAt = new Date(task.timerStartedAt).getTime();
    const updateElapsed = () => {
      const currentSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(task.accumulatedTime + currentSeconds);
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [task.timerStartedAt, task.accumulatedTime]);

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const description = formData.get("description") as string;
    const startTimeStr = formData.get("startTime") as string;
    const startTime = startTimeStr ? new Date(startTimeStr) : new Date(task.timerStartedAt);
    
    await finalizeTimer(task.id, projectId, description, startTime);
    setShowFinalize(false);
  };

  return (
    <>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 bg-card border border-primary/30 shadow-2xl rounded-3xl p-4 flex items-center gap-4 backdrop-blur-xl bg-card/90"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse flex items-center gap-1">
            <Clock className="size-3" /> Em execução
          </span>
          <span className="text-sm font-bold truncate max-w-[150px]">{task.title}</span>
        </div>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        <div className="text-xl font-mono font-bold tabular-nums text-foreground min-w-[80px]">
          {formatTime(elapsed)}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => toggleTimer(task.id, projectId)} className="rounded-xl border-primary/20 hover:bg-primary/5">
            <Pause className="size-4 text-primary" />
          </Button>
          <Button onClick={() => setShowFinalize(true)} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-4 h-9">
            <CheckCircle2 className="size-4" /> Finalizar
          </Button>
        </div>
      </motion.div>

      <Dialog open={showFinalize} onOpenChange={setShowFinalize}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <form onSubmit={handleFinalize}>
            <DialogHeader>
              <DialogTitle>Finalizar Atividade</DialogTitle>
              <DialogDescription>
                Adicione uma descrição do que foi feito e confirme o horário de início.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase text-muted-foreground">O que você fez?</Label>
                <Textarea id="description" name="description" placeholder="Descreva brevemente sua atividade..." className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime" className="text-xs font-bold uppercase text-muted-foreground">Início Real (opcional)</Label>
                <Input id="startTime" name="startTime" type="datetime-local" defaultValue={format(new Date(task.timerStartedAt), "yyyy-MM-dd'T'HH:mm")} className="rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl py-6">Confirmar e Salvar Tempo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TaskDetailsModal({ task, projectId, open, onOpenChange }: { task: any, projectId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    if (open && task.id) {
      setLoading(true);
      setEditedTitle(task.title);
      setEditedDescription(task.description || "");
      getTaskWithDetails(task.id).then(res => {
        setDetails(res);
        setLoading(false);
      });
    }
  }, [open, task.id, task.title, task.description]);

  const handleSave = async () => {
    await updateTask(task.id, projectId, editedTitle, editedDescription);
    setIsEditing(false);
  };

  const handleDownload = (file: any) => {
    if (!file.content) return;
    const link = document.createElement("a");
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddManualTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const date = new Date(formData.get("date") as string);
    const hours = parseInt(formData.get("hours") as string) || 0;
    const minutes = parseInt(formData.get("minutes") as string) || 0;
    
    await addManualTime(task.id, projectId, hours, minutes, date);
    setShowAddManual(false);
    // Refresh details
    const res = await getTaskWithDetails(task.id);
    setDetails(res);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
        <div className="relative p-8">
          <div className="flex justify-between items-start mb-6 pr-8">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2 rounded-lg border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[10px] px-2">
                {task.status}
              </Badge>
              {isEditing ? (
                <Input 
                  value={editedTitle} 
                  onChange={e => setEditedTitle(e.target.value)}
                  className="text-2xl font-black bg-muted/50 border-primary/20 rounded-xl"
                />
              ) : (
                <DialogTitle className="text-2xl font-black leading-tight">{task.title}</DialogTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button onClick={handleSave} size="sm" className="rounded-xl gap-2 px-4">
                  <Save className="size-4" /> Salvar
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="rounded-xl text-muted-foreground hover:text-primary">
                  <Edit2 className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="size-3" /> Descrição
                </h3>
                {isEditing ? (
                  <Textarea 
                    value={editedDescription} 
                    onChange={e => setEditedDescription(e.target.value)}
                    placeholder="Adicione detalhes sobre esta tarefa..."
                    className="bg-muted/30 rounded-2xl p-4 text-sm min-h-[150px] resize-none border-primary/20"
                  />
                ) : (
                  <div className="bg-muted/30 rounded-2xl p-4 text-sm leading-relaxed text-foreground/80 min-h-[100px] whitespace-pre-wrap">
                    {task.description || "Nenhuma descrição fornecida."}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="size-3" /> Histórico de Tempo
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddManual(true)} className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-lg">
                    <Plus className="size-3 mr-1" /> Adicionar Manual
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {loading ? (
                    <div className="h-20 flex items-center justify-center text-muted-foreground animate-pulse">Carregando histórico...</div>
                  ) : details?.timeEntries?.length > 0 ? (
                    details.timeEntries.map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{entry.description || "Sessão de trabalho"}</span>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(entry.startTime), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] tabular-nums bg-muted border-none">
                          {formatTime(entry.duration)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                      Nenhum tempo registrado ainda.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                   <Clock className="size-3" /> Tempo Total
                </h3>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <span className="text-2xl font-black tabular-nums text-primary">
                    {formatTime(task.accumulatedTime)}
                  </span>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                   <Paperclip className="size-3" /> Anexos ({task.files ? JSON.parse(task.files).length : 0})
                </h3>
                <div className="space-y-2">
                  {task.files && JSON.parse(task.files).map((file: any, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => handleDownload(file)}
                      className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-card border border-border/50 text-[10px] font-medium hover:border-primary/30 hover:bg-primary/5 transition-all group/file"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="size-3 text-muted-foreground shrink-0 group-hover/file:text-primary" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <Download className="size-3 text-muted-foreground opacity-0 group-hover/file:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>

      <Dialog open={showAddManual} onOpenChange={setShowAddManual}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <form onSubmit={handleAddManualTime}>
            <DialogHeader>
              <DialogTitle>Adicionar Tempo Manual</DialogTitle>
              <DialogDescription>
                Selecione o dia e quanto tempo você trabalhou nesta tarefa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-xs font-bold uppercase text-muted-foreground">Data</Label>
                <Input id="date" name="date" type="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hours" className="text-xs font-bold uppercase text-muted-foreground">Horas</Label>
                  <Input id="hours" name="hours" type="number" min="0" defaultValue="0" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minutes" className="text-xs font-bold uppercase text-muted-foreground">Minutos</Label>
                  <Input id="minutes" name="minutes" type="number" min="0" max="59" defaultValue="0" className="rounded-xl" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl py-6">Salvar Tempo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function ExportModal({ tasks, projectName, hourlyRate, open, onOpenChange }: { tasks: any[], projectName: string, hourlyRate: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [period, setPeriod] = useState({ from: format(new Date(), "yyyy-MM-01"), to: format(new Date(), "yyyy-MM-dd") });
  const [statuses, setStatuses] = useState<string[]>(["todo", "in-progress", "done"]);

  const toggleStatus = (id: string) => {
    setStatuses(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleExport = async () => {
    await exportTaskReport(tasks, projectName, hourlyRate, { from: new Date(period.from), to: new Date(period.to) }, statuses);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório PDF</DialogTitle>
          <DialogDescription>
            Selecione o período e as colunas que deseja incluir no relatório.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">De</Label>
              <Input type="date" value={period.from} onChange={e => setPeriod(p => ({ ...p, from: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Até</Label>
              <Input type="date" value={period.to} onChange={e => setPeriod(p => ({ ...p, to: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          
          <div className="grid gap-3">
             <Label className="text-xs font-bold uppercase text-muted-foreground">Colunas</Label>
             <div className="flex flex-wrap gap-2">
               {[
                 { id: "todo", label: "Para Fazer" },
                 { id: "in-progress", label: "Em Andamento" },
                 { id: "done", label: "Concluído" }
               ].map(s => (
                 <Button 
                   key={s.id} 
                   type="button"
                   variant={statuses.includes(s.id) ? "default" : "outline"}
                   size="sm"
                   className="rounded-xl text-[10px] font-bold uppercase tracking-wider"
                   onClick={() => toggleStatus(s.id)}
                 >
                   {s.label}
                 </Button>
               ))}
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExport} className="w-full rounded-xl py-6 gap-2">
            <Download className="size-4" /> Gerar Relatório PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Helper ---
const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

// --- Main Board ---

function SortableTask({ task, colId, activeTaskTimer, projectId, onSelect, onMove }: { task: any, colId: string, activeTaskTimer: any, projectId: string, onSelect: (task: any) => void, onMove: (id: string, status: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 p-4 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 h-[80px]"
      />
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={task.id}
      onClick={() => onSelect(task)}
      className={cn(
        "group relative cursor-pointer p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 border-border",
        colId === "in-progress" && "border-primary/20 bg-primary/5",
        colId === "done" && "opacity-60 grayscale-[20%]"
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-2 flex-1">
          <div {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors">
            <GripVertical className="size-3" />
          </div>
          <span className={cn("text-xs font-bold leading-tight", colId === "done" && "line-through")}>
            {task.title}
          </span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="size-3" />
            </Button>
          } onClick={(e) => e.stopPropagation()} />
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(task.id, "todo"); }} className="text-xs">Para Fazer</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(task.id, "in-progress"); }} className="text-xs">Em Andamento</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(task.id, "done"); }} className="text-xs">Concluído</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 mt-3 ml-5">
        {task.timerStartedAt ? (
           <Badge className="bg-primary/10 text-primary border-none text-[8px] uppercase tracking-tighter px-1.5 h-4 flex gap-1 items-center animate-pulse">
             <div className="size-1 rounded-full bg-primary" /> Rodando
           </Badge>
        ) : task.accumulatedTime > 0 && (
          <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md tabular-nums">
            {formatTime(task.accumulatedTime)}
          </span>
        )}

        {task.files && JSON.parse(task.files).length > 0 && (
          <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
            <Paperclip className="size-2.5" /> {JSON.parse(task.files).length}
          </span>
        )}

        <div className="flex-1" />

        <div onClick={(e) => e.stopPropagation()}>
          {task.timerStartedAt ? (
            <Button size="icon" variant="ghost" onClick={() => toggleTimer(task.id, projectId)} className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <Pause className="size-4" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="ghost" 
              disabled={!!activeTaskTimer}
              onClick={() => toggleTimer(task.id, projectId)} 
              className={cn("size-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all", !!activeTaskTimer && "opacity-20 cursor-not-allowed")}
            >
              <Play className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Board ---

export function TaskBoard({ initialTasks, projectId, projectName, hourlyRate }: { initialTasks: any[], projectId: string, projectName: string, hourlyRate: number | null }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const [activeTaskDrag, setActiveTaskDrag] = useState<any>(null);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const activeTaskTimer = useMemo(() => tasks.find(t => !!t.timerStartedAt), [tasks]);

  const columns = [
    { id: "todo", title: "Para Fazer" },
    { id: "in-progress", title: "Em Andamento" },
    { id: "done", title: "Concluído" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleMove = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, newStatus, projectId);
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTaskDrag(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].status = overId as string;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTaskDrag(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    
    // Find the task and check its new status
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // If dropped over a column or another task, status might have changed in onDragOver
      await updateTaskStatus(taskId, task.status, projectId);
    }
  };

  const handleCreate = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const fileData = [];
    const files = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement).files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await toBase64(file);
        fileData.push({ name: file.name, size: file.size, content });
      }
    }
    const filesJson = JSON.stringify(fileData);

    if (!title) return;
    
    await createTask(projectId, title, description, filesJson);
    setAddingTaskTo(null);
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      <div className="flex items-center justify-between px-2 -mt-14 mb-4">
         <div className="flex flex-col gap-1.5">
            <Link href="/" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold hover:text-primary flex items-center gap-1 transition-colors">
              <ChevronLeft className="size-3" /> Workspace
            </Link>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{projectName}</h2>
         </div>
         <div className="flex items-center gap-4">
            {hourlyRate !== null && (
              <Badge variant="secondary" className="flex items-center gap-2 h-10 px-4 rounded-xl border-border bg-card/50 text-foreground font-medium backdrop-blur-md">
                <Clock className="size-4 text-primary" /> R$ {hourlyRate}/h
              </Badge>
            )}
            <Button onClick={() => setShowExport(true)} variant="outline" className="rounded-xl h-10 gap-2 font-bold text-[10px] uppercase tracking-wider border-primary/20 bg-card/50 hover:bg-primary/5 shadow-sm backdrop-blur-md">
              <Download className="size-4" /> Exportar Relatório
            </Button>
         </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-[calc(100vh-250px)] pb-24">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <span className={cn("size-2 rounded-full", 
                    col.id === "todo" ? "bg-muted-foreground/30" : 
                    col.id === "in-progress" ? "bg-primary animate-pulse" : 
                    "bg-emerald-500"
                  )} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {col.title}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 rounded-md px-1.5 font-bold bg-muted text-muted-foreground border-border">
                  {tasks.filter(t => t.status === col.id).length}
                </Badge>
              </div>

              <SortableContext items={tasks.filter(t => t.status === col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div 
                  id={col.id}
                  className="flex flex-col gap-2 p-3 rounded-[2rem] bg-card/20 border border-border/50 min-h-[200px]"
                >
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <SortableTask 
                      key={task.id} 
                      task={task} 
                      colId={col.id} 
                      activeTaskTimer={activeTaskTimer}
                      projectId={projectId}
                      onSelect={setSelectedTask} 
                      onMove={handleMove}
                    />
                  ))}

                  <Dialog open={addingTaskTo === col.id} onOpenChange={(open) => setAddingTaskTo(open ? col.id : null)}>
                    <DialogTrigger render={
                      <Button 
                        variant="ghost"
                        className="w-full bg-card/40 border border-dashed border-border text-muted-foreground font-bold text-[9px] uppercase tracking-widest rounded-xl p-3 h-auto flex flex-row gap-2 justify-center hover:bg-card hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <Plus className="size-3" /> Nova
                      </Button>
                    } />
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                      <form onSubmit={(e) => handleCreate(e, col.id)}>
                        <DialogHeader>
                          <DialogTitle>Nova Atividade</DialogTitle>
                          <DialogDescription>
                            Adicione uma nova tarefa à coluna {col.title}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-6">
                          <div className="grid gap-2">
                            <Label htmlFor="title" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Título</Label>
                            <Input id="title" name="title" required placeholder="Título da atividade" className="rounded-xl h-10" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Descrição</Label>
                            <Textarea id="description" name="description" placeholder="Adicionar detalhes..." rows={3} className="rounded-xl resize-none" />
                          </div>
                          <div className="grid gap-2">
                             <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Anexos</Label>
                             <Input id="files" name="files" type="file" multiple className="rounded-xl h-10 text-xs cursor-pointer" />
                          </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button type="button" variant="ghost" onClick={() => setAddingTaskTo(null)} className="rounded-xl">Cancelar</Button>
                          <Button type="submit" className="rounded-xl px-8">Salvar</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTaskDrag ? (
            <div className="p-4 rounded-2xl border bg-card shadow-2xl border-primary/20 rotate-3 scale-105 pointer-events-none">
              <span className="text-xs font-bold leading-tight">{activeTaskDrag.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {activeTaskTimer && <ActiveTimer task={activeTaskTimer} projectId={projectId} />}
      </AnimatePresence>

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask} 
          projectId={projectId} 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)} 
        />
      )}

      <ExportModal 
        tasks={tasks} 
        projectName={projectName} 
        hourlyRate={hourlyRate} 
        open={showExport} 
        onOpenChange={setShowExport} 
      />
    </div>
  );
}


