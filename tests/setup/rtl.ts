import "@testing-library/jest-dom/vitest"

const storageMethods = ["clear", "getItem", "key", "removeItem", "setItem"] as const
type StorageMethod = (typeof storageMethods)[number]

class MemoryStorage implements Storage {
	private readonly items = new Map<string, string>()

	get length() {
		return this.items.size
	}

	clear() {
		this.items.clear()
	}

	getItem(key: string) {
		return this.items.get(key) ?? null
	}

	key(index: number) {
		return Array.from(this.items.keys())[index] ?? null
	}

	removeItem(key: string) {
		this.items.delete(key)
	}

	setItem(key: string, value: string) {
		this.items.set(key, value)
	}
}

function isStorageLike(value: unknown): value is Storage {
	if (typeof value !== "object" || value === null) return false
	const candidate = value as Partial<Record<StorageMethod, unknown>>
	return storageMethods.every((method) => typeof candidate[method] === "function")
}

function setMemoryStorage() {
	const storage = new MemoryStorage()
	Object.defineProperty(globalThis, "Storage", { configurable: true, value: MemoryStorage })
	Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage })
	if (typeof window !== "undefined") {
		Object.defineProperty(window, "localStorage", { configurable: true, value: storage })
	}
}

if (!isStorageLike(globalThis.localStorage)) {
	setMemoryStorage()
}
