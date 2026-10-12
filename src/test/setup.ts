import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// APIs do navegador que o jsdom não implementa e o Mantine utiliza.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// O jsdom não suporta o 2º argumento (pseudo-elemento) que o Mantine às vezes passa.
const { getComputedStyle } = window
window.getComputedStyle = (element: Element) => getComputedStyle(element)

afterEach(() => {
  localStorage.clear()
})
