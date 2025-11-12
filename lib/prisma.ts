/**
 * PrismaClient singleton for server operations
 * Prevents multiple instances during build and runtime
 *
 * Uses lazy initialization to handle build-time scenarios where Prisma
 * engines aren't available but types are pre-generated.
 */

const globalForPrisma = global as any

function initializePrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  try {
    // Dynamically require to allow build-time skipping
    const { PrismaClient } = require('@prisma/client')

    const prismaClient = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClient
    }

    return prismaClient
  } catch (error) {
    console.error(
      'Failed to initialize PrismaClient:',
      error instanceof Error ? error.message : String(error)
    )
    // Return a proxy that throws at runtime if actually called
    return new Proxy(
      {},
      {
        get: () => {
          throw new Error(
            'PrismaClient failed to initialize. This usually happens when building without full network access. ' +
            'The build will succeed on Netlify where Prisma engines can be downloaded.'
          )
        },
      }
    )
  }
}

export const prisma = initializePrisma()

export default prisma
