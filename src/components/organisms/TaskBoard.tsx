"use client";
import { useState, useEffect } from "react";
import { updateTaskStatus, toggleTimer, createTask } from "@/app/actions";
import { Play, Pause, Plus, MoreHorizontal, Paperclip } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Button } from "@/src/components/atoms/button";
import { Badge } from "@/src/components/atoms/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/atoms/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/atoms/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/atoms/dialog";
import { Input } from "@/src/components/atoms/input";
import { Textarea } from "@/src/components/atoms/textarea";
import { Label } from "@/src/components/atoms/label";

function TaskTimer({ task, projectId }: { task: any, projectId: string }) {
  const [elapsed, setElapsed] = useState(task.accumulatedTime);
  
  useEffect(() => {
    if (!task.timerStartedAt) {
      setElapsed(task.accumulatedTime);
      return;
    }
    
    const startedAt = new Date(task.timerStartedAt).getTime();
    const updateElapsed = () => {
      const currentSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(task.accumulatedTime + currentSeconds);
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [task.timerStartedAt, task.accumulatedTime]);

  const onToggle = async () => {
    await toggleTimer(task.id, projectId);
  };

  const isRunning = !!task.timerStartedAt;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all font-mono shadow-sm", 
        isRunning ? "bg-primary/10 border-primary/30 text-primary animate-pulse" : "bg-muted/50 border-border text-muted-foreground"
      )}>
      <span className="tabular-nums">{formatTime(elapsed)}</span>
      <Button variant="ghost" size="icon" onClick={onToggle} className="size-5 rounded-md hover:bg-background/50">
        {isRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
      </Button>
    </div>
  );
}

export function TaskBoard({ initialTasks, projectId }: { initialTasks: any[], projectId: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const columns = [
    { id: "todo", title: "Para Fazer" },
    { id: "in-progress", title: "Em Andamento" },
    { id: "done", title: "Concluído" },
  ];

  const handleMove = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, newStatus, projectId);
  };

  const handleCreate = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    const fileInput = formData.getAll("files") as File[];
    const fileData = fileInput.filter(f => f.size > 0).map(f => ({ name: f.name, size: f.size }));
    const filesJson = JSON.stringify(fileData);

    if (!title) return;
    
    await createTask(projectId, title, description, filesJson);
    setAddingTaskTo(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start min-h-[calc(100vh-250px)] pb-10">
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

          <div className="flex flex-col gap-3 p-3 rounded-[2rem] bg-card/20 border border-border/50 min-h-[200px]">
            {tasks.filter(t => t.status === col.id).map(task => (
              <Card key={task.id} className={cn(
                "rounded-2xl border bg-card shadow-md relative group transition-all duration-200",
                col.id === "in-progress" ? "border-primary/20" : "border-border",
                col.id === "done" && "opacity-60 grayscale-[30%]"
              )}>
                <CardHeader className="p-4 pb-2 space-y-0">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className={cn("text-sm font-bold leading-tight text-foreground", col.id === "done" && "line-through text-muted-foreground")}>
                      {task.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => handleMove(task.id, "todo")} className="text-xs">Para Fazer</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMove(task.id, "in-progress")} className="text-xs">Em Andamento</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMove(task.id, "done")} className="text-xs">Concluído</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <TaskTimer task={task} projectId={projectId} />
                    
                    {task.files && JSON.parse(task.files).length > 0 && (
                      <Badge variant="ghost" className="text-[10px] font-medium text-muted-foreground gap-1 px-1">
                         <Paperclip className="size-3" /> {JSON.parse(task.files).length}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Dialog open={addingTaskTo === col.id} onOpenChange={(open) => setAddingTaskTo(open ? col.id : null)}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost"
                  className="w-full bg-card/40 border border-dashed border-border text-muted-foreground font-bold text-[10px] uppercase tracking-widest rounded-2xl p-6 h-auto flex flex-col gap-2 hover:bg-card hover:text-primary hover:border-primary/30 transition-all duration-300"
                >
                  <Plus className="size-4" /> Nova Atividade
                </Button>
              </DialogTrigger>
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
        </div>
      ))}
    </div>
  );
}
