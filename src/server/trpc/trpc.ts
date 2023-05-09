import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { Context } from './context'

// Avoid exporting the entire t-object since it's not very
// descriptive and can be confusing to newcomers used to t
// meaning translation in i18n libraries.
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError)
            ? error.cause.flatten()
            : null,
      },
    }
  },

})
// Base router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure

export const middleware = t.middleware
