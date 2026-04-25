"use server";

import { revalidatePath } from "next/cache";
import { PrismaFolderRepository } from "@/src/infrastructure/repositories/PrismaFolderRepository";
import { PrismaProjectRepository } from "@/src/infrastructure/repositories/PrismaProjectRepository";
import { PrismaTaskRepository } from "@/src/infrastructure/repositories/PrismaTaskRepository";
import { FolderUseCases } from "@/src/application/use-cases/folder-use-cases";
import { ProjectUseCases } from "@/src/application/use-cases/project-use-cases";
import { TaskUseCases } from "@/src/application/use-cases/task-use-cases";

// Dependencies
const folderRepo = new PrismaFolderRepository();
const projectRepo = new PrismaProjectRepository();
const taskRepo = new PrismaTaskRepository();

const folderUseCases = new FolderUseCases(folderRepo);
const projectUseCases = new ProjectUseCases(projectRepo);
const taskUseCases = new TaskUseCases(taskRepo);

// Folder Actions
export async function createFolder(userId: string, name: string) {
  const folder = await folderUseCases.createFolder(userId, name);
  revalidatePath("/");
  return folder.id;
}

export async function getFolders(userId: string) {
  return folderUseCases.getFolders(userId);
}

// Project Actions
export async function createProject(
  userId: string,
  folderId: string,
  name: string,
  hourlyRate: number | null,
  fixedPrice: number | null
) {
  const project = await projectUseCases.createProject(userId, folderId, name, hourlyRate, fixedPrice);
  revalidatePath("/");
  return project.id;
}

export async function getProjects(folderId: string) {
  return projectUseCases.getProjects(folderId);
}

export async function getProject(projectId: string) {
  return projectUseCases.getProject(projectId);
}

// Task Actions
export async function createTask(
  projectId: string,
  title: string,
  description: string,
  files: string = "[]"
) {
  const task = await taskUseCases.createTask(projectId, title, description, files);
  revalidatePath("/project/" + projectId);
  revalidatePath("/");
  return task.id;
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  projectId: string
) {
  await taskUseCases.updateTaskStatus(taskId, status);
  revalidatePath("/project/" + projectId);
}

export async function toggleTimer(taskId: string, projectId: string) {
  await taskUseCases.toggleTimer(taskId);
  revalidatePath("/project/" + projectId);
}

export async function finalizeTimer(taskId: string, projectId: string, description: string, startTime: Date) {
  await taskUseCases.finalizeTimer(taskId, description, startTime);
  revalidatePath("/project/" + projectId);
}

export async function addManualTime(taskId: string, projectId: string, hours: number, minutes: number, date: Date) {
  await taskUseCases.addManualTime(taskId, hours, minutes, date);
  revalidatePath("/project/" + projectId);
}

export async function getTasks(projectId: string) {
  return taskUseCases.getTasks(projectId);
}

export async function updateTask(taskId: string, projectId: string, title: string, description: string) {
  await taskUseCases.updateTask(taskId, title, description);
  revalidatePath("/project/" + projectId);
}


export async function getTaskWithDetails(taskId: string) {
  return taskUseCases.getTaskWithDetails(taskId);
}


