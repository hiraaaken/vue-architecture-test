import type { Task, ColumnId } from './types'

/**
 * Pure function to move a task to a different column
 */
export function moveTask(task: Task, toColumnId: ColumnId): Task {
  return { ...task, columnId: toColumnId }
}

/**
 * Pure function to validate task title
 */
export function validateTaskTitle(title: string): boolean {
  return title.trim().length > 0
}

/**
 * Pure function to update task order
 */
export function updateTaskOrder(task: Task, newOrder: number): Task {
  return { ...task, order: newOrder }
}

/**
 * Pure function to sort tasks by order
 */
export function sortTasksByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order)
}

/**
 * Pure function to group tasks by column ID
 */
export function groupTasksByColumnId(tasks: Task[]): Map<ColumnId, Task[]> {
  const grouped = new Map<ColumnId, Task[]>()
  for (const task of tasks) {
    const columnTasks = grouped.get(task.columnId) || []
    columnTasks.push(task)
    grouped.set(task.columnId, columnTasks)
  }
  // Sort tasks within each column
  for (const [columnId, columnTasks] of grouped) {
    grouped.set(columnId, sortTasksByOrder(columnTasks))
  }
  return grouped
}
