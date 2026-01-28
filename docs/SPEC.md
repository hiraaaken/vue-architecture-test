# Kanban Board Application Specification

## Overview

Vue3 + Pinia を使用した中規模カンバンボードアプリケーション。
Clean Architectureの原則に基づき、テスタビリティと保守性を確保する設計。

## Architecture

### Layer Structure

```
src/
├── domain/                   # ドメイン層（Entity型、純粋関数）
├── repositories/             # ポート（Repository interface）
├── usecases/                 # アプリケーション層（純粋なUseCase関数）
├── stores/                   # 共有State（Pinia）
├── infrastructure/           # インフラ層（Repository実装）
├── composables/              # アダプター層（依存組み立て + UI State）
├── views/                    # ページコンポーネント
├── components/               # UIコンポーネント
└── router/                   # Vue Router設定
```

### Design Principles

1. **依存の方向は外→内のみ**
   ```
   View → Composable → UseCase → Domain
                           ↘ Port (interface)
                               ↑
                         Infrastructure
   ```

2. **UseCaseは純粋な関数**
   - 依存（Repository, Store）は全て引数で受け取る
   - hookやグローバル状態を内部で呼ばない
   - テスト時にmockを簡単に注入可能

3. **Composableはアダプター**
   - 依存を取得してUseCaseに注入する役割
   - UI固有の状態（フォーム、モーダル等）を管理
   - Viewに対してデータとアクションを提供

4. **Storeはビジネスロジックを持たない**
   - 純粋なState + Getters + Mutations
   - UseCaseがStoreのMutationsを呼び出して状態更新

5. **Repository Pattern（依存性逆転）**
   - `repositories/` にinterface定義
   - `infrastructure/` に実装
   - UseCaseはinterfaceに依存、実装はComposableで注入

### Data Flow

```
[User Action]
     │
     ▼
┌─────────┐
│  View   │  ← テンプレート、イベントバインディング
└────┬────┘
     │ Composable呼び出し
     ▼
┌─────────────┐
│ Composable  │  ← 依存を組み立て、UseCaseに注入
└──────┬──────┘
       │ UseCase呼び出し
       ▼
┌─────────────┐
│   UseCase   │  ← 純粋関数、ビジネスロジック
└──────┬──────┘
       │
  ┌────┴────┐
  ▼         ▼
Domain   Repository ──→ Infrastructure ──→ API
                              │
                              ▼
                           Store ──→ View（リアクティブ更新）
```

---

## Features

### Authentication

- ログイン画面（email + password）
- 認証状態のStore管理
- ルートガード（未認証時はログイン画面へリダイレクト）
- ログアウト機能

**Note**: APIはモック実装。任意のemail/passwordでログイン成功。

### Kanban Board

- 3カラム固定（To Do / In Progress / Done）
- タスク一覧表示（カラムごと）
- タスク追加（カラム内インライン入力）
- タスク編集（モーダル）
- タスク削除（編集モーダル内）
- タスク移動（ドラッグ&ドロップ、楽観的更新）

---

## Domain Model

### Entities

```typescript
// User
type UserId = string
interface User {
  id: UserId
  email: string
  name: string
}

interface AuthToken {
  accessToken: string
  expiresAt: number
}

// Kanban
type ColumnId = string
type TaskId = string

interface Column {
  id: ColumnId
  title: string
  order: number
}

interface Task {
  id: TaskId
  columnId: ColumnId
  title: string
  description: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### Command DTOs

```typescript
interface CreateTaskInput {
  columnId: ColumnId
  title: string
  description?: string
}

interface UpdateTaskInput {
  id: TaskId
  title?: string
  description?: string
}

interface MoveTaskInput {
  taskId: TaskId
  toColumnId: ColumnId
  newOrder: number
}

interface LoginInput {
  email: string
  password: string
}

interface LoginResult {
  user: User
  token: AuthToken
}
```

---

## Repository Interfaces

### AuthRepository

```typescript
interface AuthRepository {
  login(input: LoginInput): Promise<LoginResult>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
}
```

### TaskRepository

```typescript
interface TaskRepository {
  getAll(): Promise<Task[]>
  getById(id: TaskId): Promise<Task | null>
  create(input: CreateTaskInput): Promise<Task>
  update(input: UpdateTaskInput): Promise<Task>
  move(input: MoveTaskInput): Promise<Task>
  delete(id: TaskId): Promise<void>
}
```

### ColumnRepository

```typescript
interface ColumnRepository {
  getAll(): Promise<Column[]>
}
```

---

## Pinia Stores（純粋なState + Getters）

UseCase分離により、Storeはビジネスロジックを持たない。
状態の保持、派生状態の計算、状態更新関数（Mutations）のみを提供。

### authStore

**State:**
- `user: User | null`
- `token: AuthToken | null`
- `isLoading: boolean`
- `error: string | null`

**Getters:**
- `isAuthenticated: boolean`

**Mutations:**
- `setUser(user: User | null): void`
- `setToken(token: AuthToken | null): void`
- `setLoading(v: boolean): void`
- `setError(msg: string | null): void`
- `clear(): void`

### boardStore

**State:**
- `columns: Column[]`
- `tasks: Task[]`
- `isLoading: boolean`
- `error: string | null`

**Getters:**
- `sortedColumns: Column[]`
- `tasksByColumnId: Map<ColumnId, Task[]>`
- `getTaskById(id: TaskId): Task | undefined`

**Mutations:**
- `setColumns(columns: Column[]): void`
- `setTasks(tasks: Task[]): void`
- `addTask(task: Task): void`
- `updateTask(task: Task): void`
- `removeTask(id: TaskId): void`
- `setLoading(v: boolean): void`
- `setError(msg: string | null): void`

---

## UseCases

**重要: UseCaseは純粋な関数として実装する。依存は全て引数で受け取る。**

### UseCase実装パターン

```typescript
// usecases/tasks/createTask.ts

import type { TaskRepository } from '@/repositories/taskRepository'
import type { BoardStore } from '@/stores/boardStore'
import type { CreateTaskInput, Task } from '@/domain/types'

// 依存の型定義
export type CreateTaskDeps = {
  repository: TaskRepository
  store: BoardStore
}

// UseCase関数（純粋、依存は引数）
export async function createTask(
  input: CreateTaskInput,
  deps: CreateTaskDeps
): Promise<Task | null> {
  const { repository, store } = deps

  try {
    const newTask = await repository.create(input)
    store.addTask(newTask)
    return newTask
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'Failed to create task')
    return null
  }
}
```

### Composableでの呼び出し

```typescript
// composables/useBoard.ts

import { createTask } from '@/usecases/tasks/createTask'
import { taskRepositoryImpl } from '@/infrastructure/api/taskRepositoryImpl'
import { useBoardStore } from '@/stores/boardStore'

export function useBoard() {
  const store = useBoardStore()
  const taskRepository = taskRepositoryImpl

  // UseCaseに依存を注入して呼び出し
  const addTask = (columnId: ColumnId, title: string) => {
    return createTask(
      { columnId, title },
      { repository: taskRepository, store }
    )
  }

  return { addTask, /* ... */ }
}
```

### テスト

```typescript
// usecases/tasks/createTask.test.ts

import { createTask } from './createTask'

it('creates task and updates store', async () => {
  const mockRepository = {
    create: vi.fn().mockResolvedValue({ id: '1', title: 'Test' })
  }
  const mockStore = {
    addTask: vi.fn(),
    setError: vi.fn(),
  }

  const result = await createTask(
    { columnId: 'col-1', title: 'Test' },
    { repository: mockRepository, store: mockStore }
  )

  expect(mockRepository.create).toHaveBeenCalled()
  expect(mockStore.addTask).toHaveBeenCalled()
})
```

### Auth UseCases

**login**
```typescript
export async function login(
  input: LoginInput,
  deps: { repository: AuthRepository; store: AuthStore }
): Promise<boolean>
```

**logout**
```typescript
export async function logout(
  deps: { repository: AuthRepository; store: AuthStore }
): Promise<void>
```

### Board UseCases

**fetchBoard**
```typescript
export async function fetchBoard(
  deps: {
    columnRepository: ColumnRepository
    taskRepository: TaskRepository
    store: BoardStore
  }
): Promise<void>
```

**createTask**
```typescript
export async function createTask(
  input: CreateTaskInput,
  deps: { repository: TaskRepository; store: BoardStore }
): Promise<Task | null>
```

**updateTask**
```typescript
export async function updateTask(
  input: UpdateTaskInput,
  deps: { repository: TaskRepository; store: BoardStore }
): Promise<Task | null>
```

**moveTask（楽観的更新）**
```typescript
export async function moveTask(
  input: MoveTaskInput,
  deps: { repository: TaskRepository; store: BoardStore }
): Promise<boolean>
```

**deleteTask**
```typescript
export async function deleteTask(
  id: TaskId,
  deps: { repository: TaskRepository; store: BoardStore }
): Promise<boolean>
```

---

## Composables (ViewModel)

### useLogin

ログイン画面専用。フォーム状態とバリデーション、Store呼び出し。

```typescript
const useLogin = () => {
  // UI State
  const email: Ref<string>
  const password: Ref<string>
  
  // Derived
  const isValid: ComputedRef<boolean>
  const isLoading: ComputedRef<boolean>
  const error: ComputedRef<string | null>
  
  // Actions
  const submit: () => Promise<void>
}
```

### useBoard

ボード画面用。UseCase呼び出しとStore参照。

```typescript
const useBoard = () => {
  // Lifecycle: onMountedでfetchBoardUseCase実行
  
  // Derived from Store
  const columns: ComputedRef<Column[]>
  const tasksByColumnId: ComputedRef<Map<ColumnId, Task[]>>
  const isLoading: ComputedRef<boolean>
  const error: ComputedRef<string | null>
  
  // Actions (call UseCases)
  const addTask: (columnId: ColumnId, title: string) => Promise<Task | null>
  const moveTask: (input: MoveTaskInput) => Promise<boolean>
  const deleteTask: (id: TaskId) => Promise<boolean>
}
```

### useTaskEdit

タスク編集モーダル用。モーダル状態とフォーム管理。

```typescript
const useTaskEdit = () => {
  // UI State
  const isOpen: Ref<boolean>
  const title: Ref<string>
  const description: Ref<string>
  const isSaving: Ref<boolean>
  
  // Derived
  const hasChanges: ComputedRef<boolean>
  const isValid: ComputedRef<boolean>
  
  // Actions
  const open: (task: Task) => void
  const close: () => void
  const save: () => Promise<void>
  const deleteAndClose: () => Promise<void>
}
```

---

## Components

### Views

- `LoginView.vue` - ログインページ
- `BoardView.vue` - カンバンボードページ

### UI Components

- `KanbanColumn.vue` - カラム（タスク一覧 + 追加フォーム + ドロップゾーン）
- `TaskCard.vue` - タスクカード（ドラッグ可能）
- `TaskEditModal.vue` - タスク編集モーダル

---

## Router

```typescript
const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresAuth: false } },
  { path: '/board', name: 'Board', component: BoardView, meta: { requiresAuth: true } },
  { path: '/', redirect: '/board' },
]
```

**Route Guard:**
- `requiresAuth: true` かつ未認証 → `/login` へリダイレクト
- `/login` かつ認証済み → `/board` へリダイレクト

---

## Tech Stack

- Vue 3 (Composition API, `<script setup>`)
- Pinia (Setup Store形式)
- Vue Router 4
- TypeScript
- Vite

---

## Mock Implementation

APIは全てモック。`infrastructure/api/` 内で `Promise` + `delay` で非同期を模倣。

- 認証: 任意のemail/passwordで成功
- データ: インメモリ配列で管理（リロードでリセット）

---

## Future Considerations (Not in Current Scope)

- Repository注入方法の改善（Pinia Plugin or DI Container）
- テスト実装（Vitest + Vue Test Utils）
- 複数ボード対応
- WebSocketによるリアルタイム同期
- 認証トークンの永続化（localStorage）

---

## Related Documents

- `docs/ARCHITECTURE.md` — アーキテクチャ全体の解説

## References

- [Clean Architecture on Frontend - Alex Bespoyasov](https://bespoyasov.me/blog/clean-architecture-on-frontend/)
- [GitHub: frontend-clean-architecture](https://github.com/bespoyasov/frontend-clean-architecture)
