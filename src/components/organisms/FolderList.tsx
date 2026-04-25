"use client";

import { useState } from "react";
import { createFolder, createProject } from "@/app/actions";
import { Plus, ChevronRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/atoms/card";
import { Input } from "@/src/components/atoms/input";
import { Label } from "@/src/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/atoms/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/atoms/dialog";
import { Badge } from "@/src/components/atoms/badge";

export function FolderList({ initialFolders, userId }: { initialFolders: any[], userId: string }) {
  const [folders, setFolders] = useState(initialFolders);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [addingProjectForFolder, setAddingProjectForFolder] = useState<string | null>(null);

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    await createFolder(userId, newFolderName.trim());
    setIsAddingFolder(false);
    setNewFolderName("");
    window.location.reload();
  };

  const handleAddProject = async (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const pricingType = formData.get("pricingType") as string;
    const amount = Number(formData.get("amount") || 0);

    let hourlyRate = null;
    let fixedPrice = null;
    if (pricingType === "hourly") hourlyRate = amount;
    else if (pricingType === "fixed") fixedPrice = amount;

    await createProject(userId, folderId, name, hourlyRate, fixedPrice);
    setAddingProjectForFolder(null);
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Card key={folder.id} className="bg-card/40 border-border rounded-3xl flex flex-col hover:shadow-lg transition-all duration-300 group/card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                {folder.name}
              </CardTitle>
              <Dialog open={addingProjectForFolder === folder.id} onOpenChange={(open) => setAddingProjectForFolder(open ? folder.id : null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-muted-foreground hover:text-primary transition-colors gap-1 rounded-lg">
                    <Plus className="size-3" /> Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                  <form onSubmit={(e) => handleAddProject(e, folder.id)}>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Projeto</DialogTitle>
                      <DialogDescription>
                        Adicione um novo projeto à pasta {folder.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Nome do Projeto</Label>
                        <Input id="name" name="name" required placeholder="Ex: App de Gestão" className="rounded-xl h-10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="pricingType" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tipo de Preço</Label>
                          <Select name="pricingType" defaultValue="none">
                            <SelectTrigger className="rounded-xl h-10">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="none">Sem preço</SelectItem>
                              <SelectItem value="hourly">Por Hora</SelectItem>
                              <SelectItem value="fixed">Fixo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="amount" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Valor (R$)</Label>
                          <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" className="rounded-xl h-10" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button type="button" variant="ghost" onClick={() => setAddingProjectForFolder(null)} className="rounded-xl">Cancelar</Button>
                      <Button type="submit" className="rounded-xl px-8">Criar Projeto</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-3 min-h-[120px]">
              {folder.projects && folder.projects.length > 0 ? (
                folder.projects.map((project: any) => (
                  <Link key={project.id} href={`/project/${project.id}`} className="block group/item">
                    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors flex items-center gap-2">
                          <Briefcase className="size-3.5 text-muted-foreground" />
                          {project.name}
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </div>
                      
                      {(project.hourlyRate !== null || project.fixedPrice !== null) && (
                        <div className="flex items-center gap-2">
                          {project.hourlyRate !== null && (
                            <Badge variant="secondary" className="text-[9px] h-5 rounded-md px-1.5 font-bold bg-primary/5 text-primary border-primary/10">
                              R$ {project.hourlyRate}/hr
                            </Badge>
                          )}
                          {project.fixedPrice !== null && (
                            <Badge variant="secondary" className="text-[9px] h-5 rounded-md px-1.5 font-bold bg-muted text-muted-foreground border-border">
                              R$ {project.fixedPrice} Fixo
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-3xl bg-muted/10">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sem projetos</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-full min-h-[250px] rounded-3xl border-2 border-dashed border-border bg-card/20 hover:bg-card/40 hover:border-primary/40 hover:text-primary transition-all duration-300 flex flex-col gap-3 group/add"
            >
              <div className="size-12 rounded-2xl bg-muted group-hover/add:bg-primary/10 transition-colors flex items-center justify-center border border-border group-hover/add:border-primary/20">
                <Plus className="size-6 text-muted-foreground group-hover/add:text-primary transition-colors" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Nova Pasta</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <form onSubmit={handleAddFolder}>
              <DialogHeader>
                <DialogTitle>Criar Nova Pasta</DialogTitle>
                <DialogDescription>
                  Organize seus projetos em pastas temáticas ou por cliente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="folderName" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Nome da Pasta</Label>
                  <Input
                    id="folderName"
                    autoFocus
                    placeholder="Ex: Clientes 2026"
                    className="rounded-xl h-12 text-sm font-semibold"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsAddingFolder(false)} className="rounded-xl">Cancelar</Button>
                <Button type="submit" className="rounded-xl px-8">Salvar Pasta</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
