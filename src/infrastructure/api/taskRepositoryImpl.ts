import type { TaskRepository } from '@/repositories/taskRepository'
import type { Task, TaskId, ColumnId, CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '@/domain/types'
import { delay } from './delay'

// In-memory task storage (resets on reload)
let tasks: Task[] = [
  {
    id: 'task-1' as TaskId,
    columnId: 'col-todo' as ColumnId,
    title: 'Sample Task 1',
    description: 'This is a sample task',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2' as TaskId,
    columnId: 'col-todo' as ColumnId,
    title: 'Sample Task 2',
    description: '',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-3' as TaskId,
    columnId: 'col-in-progress' as ColumnId,
    title: 'In Progress Task',
    description: 'Working on this',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let nextTaskId = 4

export const taskRepositoryImpl: TaskRepository = {
  async getAll(): Promise<Task[]> {
    await delay(300)
    return [...tasks]
  },

  async getById(id: TaskId): Promise<Task | null> {
    await delay(100)
    return tasks.find(t => t.id === id) || null
  },

  async create(input: CreateTaskInput): Promise<Task> {
    await delay(300)

    const columnTasks = tasks.filter(t => t.columnId === input.columnId)
    const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.order), -1)

    const newTask: Task = {
      id: `task-${nextTaskId++}` as TaskId,
      columnId: input.columnId,
      title: input.title,
      description: input.description || '',
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    tasks.push(newTask)
    return newTask
  },

  async update(input: UpdateTaskInput): Promise<Task> {
    await delay(300)

    const index = tasks.findIndex(t => t.id === input.id)
    if (index === -1) {
      throw new Error('Task not found')
    }

    const updatedTask: Task = {
      ...tasks[index],
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      updatedAt: new Date(),
    }

    tasks[index] = updatedTask
    return updatedTask
  },

  async move(input: MoveTaskInput): Promise<Task> {
    await delay(200)

    const index = tasks.findIndex(t => t.id === input.taskId)
    if (index === -1) {
      throw new Error('Task not found')
    }

    const movedTask: Task = {
      ...tasks[index],
      columnId: input.toColumnId,
      order: input.newOrder,
      updatedAt: new Date(),
    }

    tasks[index] = movedTask
    return movedTask
  },

  async delete(id: TaskId): Promise<void> {
    await delay(200)

    const index = tasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new Error('Task not found')
    }

    tasks.splice(index, 1)
  },
}
