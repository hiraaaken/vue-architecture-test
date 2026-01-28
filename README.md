# Vue Architecture Test

Vue 3 + Pinia で **Clean Architecture** を実践するための検証プロジェクトです。

## 検証目的

フロントエンドにおける Clean Architecture の適用方法を検証します。特に以下のポイントに焦点を当てています:

### 1. UseCase を純粋関数として実装する

従来の Pinia Store にビジネスロジックを含める方法ではなく、UseCase を**純粋関数**として分離します。

```typescript
// 依存は全て引数で受け取る
export async function createTask(
  input: CreateTaskInput,
  deps: { repository: TaskRepository; store: BoardStore }
): Promise<Task | null> {
  const newTask = await deps.repository.create(input)
  deps.store.addTask(newTask)
  return newTask
}
```

**メリット:**
- `vi.mock` なしでテスト可能
- 依存関係が明示的
- フレームワーク非依存

### 2. Composable をアダプターとして使う

Composable は UseCase を直接実装するのではなく、**アダプター**として機能します。

```typescript
export function useBoard() {
  const store = useBoardStore()

  // 依存を組み立てて UseCase に注入
  const addTask = (columnId, title) => {
    return createTask(
      { columnId, title },
      { repository: taskRepositoryImpl, store }
    )
  }

  return { addTask }
}
```

### 3. Store はビジネスロジックを持たない

Store は **State + Getters + Mutations** のみを提供し、ビジネスロジックは UseCase に委譲します。

## アーキテクチャ

```
View → Composable → UseCase → Domain
                        ↘ Port (interface)
                            ↑
                      Infrastructure
```

| レイヤー | 場所 | 責務 |
|---------|------|------|
| Domain | `src/domain/` | Entity型、純粋関数 |
| Port | `src/repositories/` | Repository interface |
| UseCase | `src/usecases/` | ビジネスロジック（純粋関数） |
| Store | `src/stores/` | State + Getters + Mutations |
| Infrastructure | `src/infrastructure/` | Repository実装 |
| Composable | `src/composables/` | アダプター（依存の組み立て） |

## 技術スタック

- Vue 3 (Composition API)
- Pinia
- Vue Router 4
- TypeScript
- Vite 7
- Tailwind CSS v4
- shadcn-vue (radix-vue)

## セットアップ

```bash
npm install
npm run dev
```

## 参考資料

- [Clean Architecture on Frontend - Alex Bespoyasov](https://bespoyasov.me/blog/clean-architecture-on-frontend/)
- [DDD, Hexagonal, Onion, Clean, CQRS... How I put it all together](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)
