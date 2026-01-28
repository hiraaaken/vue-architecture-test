import type { Task, TaskId, CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '@/domain/types'

export interface TaskRepository {
  getAll(): Promise<Task[]>
  getById(id: TaskId): Promise<Task | null>
  create(input: CreateTaskInput): Promise<Task>
  update(input: UpdateTaskInput): Promise<Task>
  move(input: MoveTaskInput): Promise<Task>
  delete(id: TaskId): Promise<void>
}
