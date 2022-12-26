import { createClient } from 'redis'
import type { PrismaClient } from '@prisma/client' // bancho.py
import type { Id } from '../config'
import { prismaClient } from '.'
import { BanchoPyMode } from '~/adapters/bancho.py/enums'
import { createRulesetData } from '~/adapters/bancho.py/transforms'
import { idToString } from '~/adapters/bancho.py/transforms/id-conversion'

import type { UserDataProvider as Base } from '$def/client/user'
import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'

import type {
  UserStatistic,
} from '~/types/user'

import { UserDataProvider as BanchoPyUser } from '~/adapters/bancho.py/client'

const redisClient
  = Boolean(process.env.REDIS_URI)
  && createClient({
    url: process.env.REDIS_URI,
  })

async function getLiveRank(id: number, mode: number, country: string) {
  if (redisClient) {
    return {
      rank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}`,
        idToString(id),
      ),
      countryRank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}:${country}`,
        idToString(id),
      ),
    }
  }
}

export class UserDataProvider extends BanchoPyUser implements Base<Id> {
  sbDb: PrismaClient

  constructor() {
    super()
    this.sbDb = prismaClient
  }

  async getStatistics({
    id,
    country,
  }: {
    id: Id
    country: string
  }) {
    const [results, ranks, livePPRank] = await Promise.all([
      this.db.stat.findMany({
        where: {
          id,
        },
      }),

      this.db.$queryRaw<
        Array<{
          id: Id
          mode: number
          ppv2Rank: bigint
          totalScoreRank: bigint
          rankedScoreRank: bigint
        }>
      >/* sql */`
SELECT 
  id,
  mode,
  (SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = r.mode AND s.pp > r.pp) AS ppv2Rank,
  (SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = r.mode AND s.tscore > r.tscore) AS totalScoreRank,
  (SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = r.mode AND s.rscore > r.rscore) AS rankedScoreRank
FROM stats r
  SELECT * FROM r
  WHERE id = ${id}
  `.catch(_ => []),

      redisClient
        ? {
            osu: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
              relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
              autopilot: await getLiveRank(id, BanchoPyMode.osuAutopilot, country),
            },
            taiko: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
              relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
            },
            fruits: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
              relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
            },
            mania: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
            },
          }
        : undefined,
    ])

    const statistics: UserStatistic<Id, Mode, Ruleset, OverallLeaderboardRankingSystem> = {
      osu: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuStandard),
          livePPRank: livePPRank?.osu.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(i => i.mode === BanchoPyMode.osuRelax),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuRelax),
          livePPRank: livePPRank?.osu.relax,
        }),
        autopilot: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuAutopilot,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
          livePPRank: livePPRank?.osu.autopilot,
        }),
      },
      taiko: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
          livePPRank: livePPRank?.taiko.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(i => i.mode === BanchoPyMode.taikoRelax),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
          livePPRank: livePPRank?.taiko.relax,
        }),
      },
      fruits: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
          livePPRank: livePPRank?.fruits.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsRelax,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
          livePPRank: livePPRank?.fruits.relax,
        }),
      },
      mania: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.maniaStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
          livePPRank: livePPRank?.mania.standard,
        }),
      },
    }
    return statistics
  }
}