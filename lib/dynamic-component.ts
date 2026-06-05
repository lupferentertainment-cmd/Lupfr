import type { ComponentType } from "react"

export type DynamicComponent = ComponentType<Record<string, never>>

export function resolveDynamicComponent<TName extends string>(
  mod: Record<TName, unknown>,
  name: TName,
  source: string
): DynamicComponent {
  const component = mod[name]
  if (isDynamicComponent(component)) return component
  throw new Error(`${source} must export a React component named ${name}.`)
}

function isDynamicComponent(value: unknown): value is DynamicComponent {
  if (typeof value === "function") return true
  if (!isObject(value)) return false
  return "$$typeof" in value
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null
}
