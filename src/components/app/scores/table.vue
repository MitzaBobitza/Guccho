<script setup lang="ts">
import { StableMod } from '~/def/score'
import type { RankingSystem } from '~/def/common'
import { Rank } from '~/def'
import type { BeatmapLeaderboard } from '~/def/leaderboard'

const props = withDefaults(
  defineProps<{
    scores: BeatmapLeaderboard<string>[]
    rankingSystem: RankingSystem
  }>(),
  {
    rankingSystem: Rank.PPv2,
  }
)

const { t } = useI18n()

const comma = createNumberFormatter()
const pp = createPPFormatter()
</script>

<i18n lang="yaml">
en-GB:
  no-score: No Score has been set so far.

zh-CN:
  no-score: 目前还没有任何成绩。
</i18n>

<template>
  <table class="table table-compact table-zebra">
    <thead>
      <tr>
        <th>{{ t('global.player') }}</th>
        <th class="text-right">
          {{ t('global.rank') }}
        </th>
        <th class="text-right">
          {{ t('global.mods') }}
        </th>
        <th class="text-right">
          {{ t(localeKey.rankingSystem(rankingSystem)) }}
        </th>
        <th>{{ t('global.played-at') }}</th>
        <!-- <th class="text-center">
          Actions
        </th> -->
      </tr>
    </thead>
    <tbody>
      <template v-if="props.scores.length">
        <tr v-for="(item, index) in props.scores" :key="index">
          <th>
            <div class="flex gap-2 items-center">
              <div class="aspect-square mask mask-squircle flex">
                <img
                  class="m-auto"
                  :src="item.user.avatarSrc"
                  :alt="item.user.name"
                  width="30"
                >
              </div>
              <nuxt-link-locale
                :to="{
                  name: 'user-handle',
                  params: { handle: item.user.safeName },
                }"
                :class="useUserRoleColor(item.user)"
              >
                {{ item.user.name }}
              </nuxt-link-locale>
            </div>
          </th>
          <td class="text-right">
            #{{ index + 1 }}
          </td>
          <td class="flex justify-end gap-1 tooltip tooltip-primary lg:tooltip-right" :data-tip="item.score.mods.map(m => StableMod[m]).join(', ')">
            <app-mod v-for="mod in item.score.mods" :key="mod" :mod="mod" class="w-6 h-6" />
          </td>
          <td class="text-right font-mono">
            {{ comma(item.score.score) }}
          </td>
          <td v-if="rankingSystem === Rank.PPv2" class="text-right font-mono">
            {{ pp(item.score[Rank.PPv2] || 0) }}
          </td>
          <td v-else-if="rankingSystem === Rank.PPv1" class="text-right font-mono">
            {{ pp(item.score[Rank.PPv2] || 0) }}
          </td>
          <td class="font-mono">
            {{ item.score.playedAt.toLocaleDateString() }}
            {{ item.score.playedAt.toLocaleTimeString() }}
          </td>
          <!-- <td class="text-center">
            <div class="btn-group">
              <t-button size="sm" variant="ghost">
                download replay
              </t-button>
              <t-button size="sm" variant="ghost">
                detail
              </t-button>
            </div>
          </td> -->
        </tr>
      </template>
      <template v-else>
        <tr>
          <th colspan="6">
            <div class="text-center">
              {{ t('no-score') }}
            </div>
          </th>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped></style>
