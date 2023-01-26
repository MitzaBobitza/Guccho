import type { AssertHasOverallRankingSystem, AssertHasRankingSystem } from '~/types/server'
import type { LeaderboardRankingSystem, RankingSystem } from '~/types/common'

export type Id = string
export type ScoreId = string

export const assertHasRankingSystem: AssertHasRankingSystem = (rankingSystem): rankingSystem is RankingSystem => false
export const assertHasOverallRankingSystem: AssertHasOverallRankingSystem = (rankingSystem): rankingSystem is LeaderboardRankingSystem => false