import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import {
  passwordMismatch,
  sessionNotFound,
  unableToRetrieveSession,
  unknownError,
} from '../messages'
import { sessionProcedure as pSession } from '../middleware/session'
import { zodHandle } from '../shapes'
import { router as _router } from '../trpc'
import { Logger } from '$base/log'
import { SessionProvider, UserProvider } from '$active/server'
import { Scope } from '~/def/user'

const logger = Logger.child({ label: 'session', backend: 'transport', transport: 'trpc' })

const userProvider = new UserProvider()
const sessionProvider = new SessionProvider()
export const router = _router({
  login: pSession
    .input(
      z.object({
        handle: zodHandle,
        md5HashedPassword: z.string(),
      })
    )
    .query(async ({ input: { handle, md5HashedPassword }, ctx }) => {
      try {
        const user = await userProvider.getEssential({
          handle,
          scope: Scope.Self,
        })
        const result = await bcrypt.compare(md5HashedPassword, user.password)
        if (!result) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: passwordMismatch,
          })
        }
        const session = await ctx.session.getBinding()
        if (!session) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: unableToRetrieveSession,
          })
        }
        const newSessionId = await sessionProvider.update(ctx.session.id, { userId: UserProvider.idToString(user.id) })
        if (newSessionId && newSessionId !== ctx.session.id) {
          setCookie(ctx.h3Event, 'session', newSessionId, { httpOnly: true })
        }
        return {
          user: mapId(user, UserProvider.idToString),
        }
      }
      catch (err) {
        if (err instanceof TRPCError) {
          throw err
        }

        logger.error(err)

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: unknownError,
        })
      }
    }),
  retrieve: pSession
    .query(async ({ ctx }) => {
      const session = await ctx.session.getBinding()

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: sessionNotFound,
        })
      }
      if (session.userId) {
        try {
          const user = await userProvider.getEssentialById({
            id: UserProvider.stringToId(session.userId),
          })
          return {
            user: mapId(user, UserProvider.idToString),
          }
        }
        catch (_) {
          return {
            user: null,
          }
        }
      }
      return {
        user: null,
      }
    }),
  destroy: pSession.mutation(({ ctx }) => {
    deleteCookie(ctx.h3Event, 'session')
    return sessionProvider.destroy(ctx.session.id)
  }),
})
