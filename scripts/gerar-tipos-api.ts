// Gera src/shared/api/generated/openapi-types.ts a partir do schema OpenAPI
// exposto pelo back (springdoc, /v3/api-docs). Uso: npm run gen:api-types
// (ver design.md da change codegen-tipos-openapi para o racional).
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import openapiTS, { astToString } from 'openapi-typescript'

const SOURCE_URL = process.env.API_TYPES_SOURCE_URL || 'http://localhost:8080'
const SCHEMA_PATH = '/v3/api-docs'
const OUTPUT_PATH = path.resolve(import.meta.dirname, '..', 'src/shared/api/generated/openapi-types.ts')

function cabecalho(origem: string): string {
  return `/**
 * ARQUIVO GERADO AUTOMATICAMENTE — não edite à mão.
 *
 * Gerado por: npm run gen:api-types
 * Origem: ${origem}
 * Data: ${new Date().toISOString()}
 */\n\n`
}

async function main() {
  const schemaUrl = `${SOURCE_URL}${SCHEMA_PATH}`
  let ast
  try {
    ast = await openapiTS(new URL(schemaUrl))
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message : String(erro)
    console.error(
      `Falha ao gerar tipos a partir de ${schemaUrl}: ${motivo}\n` +
        `Verifique se o back está rodando e acessível nessa URL ` +
        `(configure API_TYPES_SOURCE_URL para apontar para outro endereço).`,
    )
    process.exitCode = 1
    return
  }

  const conteudo = cabecalho(schemaUrl) + astToString(ast)
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, conteudo, 'utf-8')
  console.log(`Tipos gerados em ${path.relative(process.cwd(), OUTPUT_PATH)}`)
}

main()
