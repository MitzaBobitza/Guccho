import { any, array, boolean, object, record, string, union } from 'zod'
import { router as _router } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { optionalUserProcedure } from '../middleware/optional-user'
import { userProcedure } from '../middleware/user'
import { ArticleProvider } from '$active/server'

const sp = new ArticleProvider()
export const router = _router({
  get: userProcedure.input(string().trim()).query(({ input, ctx }) => sp.get({ slug: input, user: ctx.user })),
  getRendered: optionalUserProcedure.input(union([string().trim(), array(string().trim())])).query(async ({ input, ctx }) => {
    if (Array.isArray(input)) {
      input = input.join('/')
    }
    const r = await sp.get({ slug: input, fallback: true, user: ctx.user })
    if (!r) {
      const notFound = sp.fallbacks.get('404')
      if (!notFound) {
        throw new Error('404 not found')
      }
      const html = notFound.dynamic ? await sp.render(notFound.json) : notFound.html

      return {
        html,
        access: {
          read: true,
          write: false,
        },
      }
    }
    return {
      html: r.dynamic ? await sp.render(r.json) : r.html,
      access: r.access,
    }
  }),

  save: adminProcedure.input(object({
    slug: string().trim(),
    json: record(any(), any()).refine((arg): arg is ArticleProvider.JSONContent => {
      return !!arg
    }),
    privilege: object({
      read: array(ArticleProvider.readAccess),
      write: array(ArticleProvider.writeAccess),
    }),
    dynamic: boolean(),
  })).mutation(({ input, ctx }) => sp.save(Object.assign(input, { user: ctx.user }))),

  delete: adminProcedure.input(object({
    slug: string().trim(),
  })).mutation(({ input, ctx }) => sp.delete(Object.assign(input, { user: ctx.user }))),

  localSlugs: adminProcedure.input(string().trim().optional()).query(({ input }) => sp.getLocalSlugs(input)),
})
