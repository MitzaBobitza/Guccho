import z from 'zod'
// import { createRouter } from '../context'
import { router as _router, publicProcedure } from '../trpc'
import { zodMode, zodRankingSystem, zodRuleset } from './../shapes/index'
import { getLeaderboard } from '$/client/leaderboard'
import { Range } from '~/types/common'
export const router = _router({
  fetch: publicProcedure
    .input(z.object({
      mode: zodMode,
      ruleset: zodRuleset,
      rankingSystem: zodRankingSystem,
      page: z.number().gte(0).lt(10),
      pageSize: z.number().gte(20).lt(51)
    }))
    .query(async ({ input: { mode, ruleset, rankingSystem, page, pageSize } }) => {
      return await getLeaderboard({ mode, ruleset, rankingSystem, page: page as Range<0, 10>, pageSize: pageSize as Range<20, 51> })
    })
})