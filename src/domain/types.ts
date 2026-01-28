// Branded types for type safety
export type UserId = string & { readonly brand: unique symbol }
export type ColumnId = string & { readonly brand: unique symbol }
export type TaskId = string & { readonly brand: unique symbol }

// User domain
export interface User {
  id: UserId
  email: string
  name: string
}

export interface AuthToken {
  accessToken: string
  expiresAt: number
}

// Kanban domain
export interface Column {
  id: ColumnId
  title: string
  order: number
}

export interface Task {
  id: TaskId
  columnId: ColumnId
  title: string
  description: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Command DTOs
export interface CreateTaskInput {
  columnId: ColumnId
  title: string
  description?: string
}

export interface UpdateTaskInput {
  id: TaskId
  title?: string
  description?: string
}

export interface MoveTaskInput {
  taskId: TaskId
  toColumnId: ColumnId
  newOrder: number
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  token: AuthToken
}
