// GitHub Pages não conhece as rotas do React Router: qualquer caminho
// desconhecido (ex.: /vitrine-dummyjson/produtos/5) cai no 404.html.
// Copiando o index.html para 404.html, a SPA carrega e o roteador assume.
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')
const index = resolve(dist, 'index.html')

if (!existsSync(index)) {
  console.error('dist/index.html não encontrado. Rode "vite build" antes.')
  process.exit(1)
}

copyFileSync(index, resolve(dist, '404.html'))
console.log('✓ dist/404.html criado (fallback de SPA para o GitHub Pages)')
