# Vue3 + Pinia Frontend Architecture

## 概要

Clean Architectureの原則に基づいたフロントエンドアーキテクチャ。
テスタビリティ、保守性、拡張性を重視した設計。

## 参考資料

- [Clean Architecture on Frontend - Alex Bespoyasov](https://bespoyasov.me/blog/clean-architecture-on-frontend/)
- [GitHub: frontend-clean-architecture](https://github.com/bespoyasov/frontend-clean-architecture)
- [DDD, Hexagonal, Onion, Clean, CQRS... How I put it all together](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)

---

## レイヤー構造

```
┌─────────────────────────────────────────────────────────────┐
│  View (*.vue)                                               │
│  - テンプレート、イベントバインディング                        │
└─────────────────────────────────────────────────────────────┘
                          ↓ 依存
┌─────────────────────────────────────────────────────────────┐
│  Composable (useXxx.ts) ← アダプター層                       │
│  - 依存の組み立て（Repository/Storeを取得しUseCaseに渡す）     │
│  - UI State（フォーム、モーダル等）                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 依存
┌─────────────────────────────────────────────────────────────┐
│  UseCase (usecases/*.ts) ← アプリケーション層                 │
│  - 純粋な関数（依存は引数で受け取る）                          │
│  - ビジネスロジックのオーケストレーション                      │
└───────────┬─────────────────────────────────┬───────────────┘
            ↓ 依存                            ↓ 依存
┌───────────────────────────┐    ┌────────────────────────────┐
│  Domain (domain/*.ts)     │    │  Port (repositories/*.ts)  │
│  - Entity型定義           │    │  - Repository interface    │
│  - 純粋な変換関数         │    │                            │
└───────────────────────────┘    └────────────────────────────┘
                                              ↑ 実装
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure (infrastructure/*.ts)                       │
│  - Repository実装                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Store (stores/*.ts)                                        │
│  - 共有State + Getters + Mutations                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 各層の責務

### 1. Domain（ドメイン層）

**場所:** `src/domain/`

**責務:**
- Entityの型定義
- 純粋な変換関数（ビジネスルール）
- 外部依存なし

```typescript
// domain/task.ts

export interface Task {
  id: TaskId
  columnId: ColumnId
  title: string
  order: number
}

// 純粋な変換関数
export function moveTask(task: Task, toColumnId: ColumnId): Task {
  return { ...task, columnId: toColumnId }
}

export function validateTaskTitle(title: string): boolean {
  return title.trim().length > 0
}
```

**ポイント:**
- `Date.now()` や外部API呼び出しなど副作用を持たない
- 引数を受け取り、新しい値を返すだけ

---

### 2. Port（Repository Interface）

**場所:** `src/repositories/`

**責務:**
- 外部サービスとの通信インターフェース定義
- アプリケーションが「こう呼び出したい」という願望を表現

```typescript
// repositories/taskRepository.ts

export interface TaskRepository {
  getAll(): Promise<Task[]>
  create(input: CreateTaskInput): Promise<Task>
  delete(id: TaskId): Promise<void>
}
```

**ポイント:**
- 実装の詳細（HTTP、GraphQL等）は含まない
- UseCaseはこのinterfaceに依存する

---

### 3. UseCase（アプリケーション層）

**場所:** `src/usecases/`

**責務:**
- ビジネスロジックのオーケストレーション
- **純粋な関数**として実装
- 依存（Repository, Store）は**全て引数で受け取る**

```typescript
// usecases/tasks/createTask.ts

export type CreateTaskDeps = {
  repository: TaskRepository
  store: BoardStore
}

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
    store.setError('Failed to create task')
    return null
  }
}
```

**なぜ依存を引数で受け取るのか:**

1. **テスタビリティ** - vi.mockなしでテスト可能
2. **明示的な依存関係** - 関数シグネチャで依存が分かる
3. **フレームワーク非依存** - hook呼び出しがないので純粋

```typescript
// テスト例
it('creates task', async () => {
  const mockRepo = { create: vi.fn().mockResolvedValue({ id: '1' }) }
  const mockStore = { addTask: vi.fn(), setError: vi.fn() }

  await createTask({ title: 'Test' }, { repository: mockRepo, store: mockStore })

  expect(mockRepo.create).toHaveBeenCalled()
  expect(mockStore.addTask).toHaveBeenCalled()
})
```

---

### 4. Store（共有State）

**場所:** `src/stores/`

**責務:**
- アプリケーション全体で共有する状態
- Getters（派生状態）
- Mutations（状態更新関数）
- **ビジネスロジックは持たない**

```typescript
// stores/boardStore.ts

export const useBoardStore = defineStore('board', () => {
  const tasks = ref<Task[]>([])
  const error = ref<string | null>(null)

  // Getter
  const tasksByColumnId = computed(() => { /* ... */ })

  // Mutations
  const addTask = (task: Task) => { tasks.value.push(task) }
  const setError = (msg: string | null) => { error.value = msg }

  return { tasks, error, tasksByColumnId, addTask, setError }
})

export type BoardStore = ReturnType<typeof useBoardStore>
```

---

### 5. Infrastructure（インフラ層）

**場所:** `src/infrastructure/`

**責務:**
- Repository interfaceの実装
- 外部APIとの実際の通信

```typescript
// infrastructure/api/taskRepositoryImpl.ts

export const taskRepositoryImpl: TaskRepository = {
  async getAll() {
    const response = await fetch('/api/tasks')
    return response.json()
  },
  async create(input) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input)
    })
    return response.json()
  }
}
```

---

### 6. Composable（アダプター層）

**場所:** `src/composables/`

**責務:**
- **アダプター**として機能
- 依存を取得してUseCaseに注入
- UI固有の状態管理

```typescript
// composables/useBoard.ts

import { createTask } from '@/usecases/tasks/createTask'
import { taskRepositoryImpl } from '@/infrastructure/api/taskRepositoryImpl'
import { useBoardStore } from '@/stores/boardStore'

export function useBoard() {
  const store = useBoardStore()
  const taskRepository = taskRepositoryImpl

  // UseCaseに依存を注入
  const addTask = (columnId: ColumnId, title: string) => {
    return createTask(
      { columnId, title },
      { repository: taskRepository, store }
    )
  }

  return {
    tasks: computed(() => store.tasks),
    addTask,
  }
}
```

**ComposableはアダプターでありUseCaseではない**

Alex Bespoyasovの記事より:
> In a canonical implementation, the function of the use case would be located outside the hook, and the services would be passed to the use case via a last argument or via a DI.

hookはアダプターとして機能し、UseCase関数は外に出す。

---

### 7. View（UI層）

**場所:** `src/views/`, `src/components/`

**責務:**
- テンプレート
- イベントバインディング
- Composableを呼び出すだけ

```vue
<script setup lang="ts">
import { useBoard } from '@/composables/useBoard'

const { tasks, addTask } = useBoard()
</script>

<template>
  <button @click="addTask('col-1', 'New Task')">Add</button>
</template>
```

---

## 依存の方向

**原則: 外側 → 内側のみ**

```
View → Composable → UseCase → Domain
                        ↘ Port (interface)
                            ↑
                      Infrastructure
```

- Domainは何にも依存しない
- UseCaseはDomainとPort（interface）に依存
- Composableは全ての層を知っている（アダプターなので許容）

---

## impure/pure サンドイッチ

Clean Architectureでは「副作用 → 純粋な変換 → 副作用」というパターンを推奨。

```typescript
async function createTask(input, deps) {
  // 副作用: データ取得/永続化
  const newTask = await deps.repository.create(input)
  
  // 純粋な変換（必要なら）
  const validated = validateTask(newTask)
  
  // 副作用: 状態更新
  deps.store.addTask(validated)
}
```

---

## Store内包型 vs UseCase分離型

### Store内包型（一般的なPiniaの使い方）

```typescript
// stores/boardStore.ts
const createTask = async (input) => {
  const newTask = await taskRepository.create(input)
  tasks.value.push(newTask)
}
```

**問題点:**
1. StoreがビジネスロジックとStateの両方を担う
2. Repositoryがハードコードされ、テスト時にvi.mock必要
3. 責務が曖昧になりやすい

### UseCase分離型（本アーキテクチャ）

```typescript
// usecases/tasks/createTask.ts
export async function createTask(input, deps) {
  const newTask = await deps.repository.create(input)
  deps.store.addTask(newTask)
}
```

**利点:**
1. UseCase単体でテスト可能
2. 依存が明示的
3. Storeは純粋なState管理のみ

---

## テスト戦略

| 層 | テスト方法 | Mock対象 |
|----|-----------|----------|
| Domain | 単体テスト | なし（純粋関数） |
| UseCase | 単体テスト | Repository, Store |
| Store | 単体テスト | なし |
| Composable | 統合テスト | 必要に応じて |
| View | E2Eテスト | - |

---

## ディレクトリ構成

```
src/
├── domain/                   # Entity型、純粋関数
│   ├── types.ts
│   └── task.ts
├── repositories/             # Repository interface
│   └── taskRepository.ts
├── usecases/                 # UseCase関数
│   └── tasks/
│       ├── createTask.ts
│       └── createTask.test.ts
├── stores/                   # Pinia Store
│   └── boardStore.ts
├── infrastructure/           # Repository実装
│   └── api/
│       └── taskRepositoryImpl.ts
├── composables/              # アダプター
│   └── useBoard.ts
├── views/                    # ページ
│   └── BoardView.vue
└── components/               # UIコンポーネント
    └── TaskCard.vue
```

---

## まとめ

| 層 | 責務 | 依存 |
|----|------|------|
| Domain | Entity型、純粋関数 | なし |
| Port | Repository interface | Domain型 |
| UseCase | ビジネスロジック（純粋関数） | Domain、Port |
| Store | 共有State、Getters、Mutations | Domain型 |
| Infrastructure | Port実装 | Port |
| Composable | アダプター、依存組み立て | 全て |
| View | テンプレート、イベント | Composable |

**3つの原則:**
1. 依存は外→内のみ
2. UseCaseは純粋関数、依存は引数
3. Composableがアダプターとして依存を組み立てる
