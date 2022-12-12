import type { Awaitable } from '~/types/common'
import type { BeatmapEssential, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus } from '~/types/beatmap'

export namespace MapDataProvider {
  export interface IdQuery {
    id: string
  }
}
export abstract class MapDataProvider<Id> {
  abstract getBeatmapset(query: MapDataProvider.IdQuery): Awaitable<Beatmapset<BeatmapSource, Id, unknown> & { beatmaps: BeatmapEssential<Id, unknown>[] } | null>
  abstract getBeatmap(query: MapDataProvider.IdQuery): Awaitable<BeatmapWithMeta<BeatmapSource, RankingStatus, Id, unknown> | null>
}