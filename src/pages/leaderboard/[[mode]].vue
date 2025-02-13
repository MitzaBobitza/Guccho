<script setup lang="ts">
// TODO check max pages
import type { ActiveMode, ActiveRuleset, LeaderboardRankingSystem } from '~/def/common'
import type { SwitcherPropType } from '~/composables/useSwitcher'

const config = useAppConfig()

const route = useRoute('leaderboard-mode')
const router = useRouter()
const app$ = useNuxtApp()
const { supportedModes, supportedRulesets } = useAdapterConfig()
const { t } = useI18n()

const { mode: pMode } = route.params
const { ruleset: pRuleset, ranking: pRankingSystem, page: pPage } = route.query

const availableRankingSystems = Object.keys(config.leaderboardRankingSystem)
const mode = (
  (isString(pMode) && includes(pMode, supportedModes))
    ? pMode
    : supportedModes[0]
) as ActiveMode

const ruleset = (
  (isString(pRuleset) && includes(pRuleset, supportedRulesets))
    ? pRuleset
    : supportedRulesets[0]
) as ActiveRuleset

const rankingSystem = (
  (isString(pRankingSystem) && availableRankingSystems.includes(pRankingSystem))
    ? pRankingSystem
    : availableRankingSystems[0]
) as LeaderboardRankingSystem

const page = shallowRef((isString(pPage) && Number.parseInt(pPage)) || 1)

const perPage = 20

const total = await app$.$client.leaderboard.overallRange.query()

const outOfRange = page.value * perPage - perPage > total
if (outOfRange) {
  page.value = Math.floor(total / perPage)
}

const selected = shallowRef<Required<SwitcherPropType<LeaderboardRankingSystem>>>({
  mode,
  ruleset,
  rankingSystem,
})
const {
  data: table,
  pending,
  refresh,
} = await useAsyncData(() =>
  app$.$client.leaderboard.overall.query({
    mode: selected.value.mode,
    ruleset: selected.value.ruleset,
    rankingSystem: selected.value.rankingSystem,
    page: page.value - 1,
    pageSize: perPage,
  })
)

useHead({
  titleTemplate: `%s - Leaderboard - ${config.title}`,
  title: computed(() => ` ${selected.value.mode} | ${selected.value.ruleset} | ${selected.value.rankingSystem}`),
})

function rewriteHistory() {
  const l = window.location
  const r = router.resolve({
    name: 'leaderboard-mode',
    params: {
      mode: selected.value.mode,
    },
    query: {
      ranking: selected.value.rankingSystem,
      ruleset: selected.value.ruleset,
      page: page.value,
    },
  })

  const rewrite = l.origin + r.fullPath
  history.replaceState({}, '', rewrite)
}

function reloadPage(i?: number) {
  if (i) {
    page.value = i
  }
  rewriteHistory()
  refresh()
}
</script>

<i18n lang="yaml">
en-GB:
  no-score: No one played this mode yet.
  no-score-alt: Wanna be the first one? Go for it.

zh-CN:
  no-score: 该模式目前还没有人玩过。
  no-score-alt: 想要成为第一名吗? 冲吧!
</i18n>

<template>
  <div class="flex flex-col h-full leaderboard custom-container mx-auto">
    <header-simple-title-with-sub
      class="container mx-auto custom-container !max-w-4xl"
      :title="t('titles.leaderboard')"
      :subtitle="
        (selected.mode
          && selected.ruleset
          && selected.rankingSystem
          && `${t(localeKey.mode(selected.mode))} - ${
            t(localeKey.ruleset(selected.ruleset))
          } | ${t(localeKey.rankingSystem(selected.rankingSystem))}`)
          || ''
      "
    >
      <app-mode-switcher
        v-model="selected"
        :show-sort="true"
        @update:model-value="reloadPage()"
      />
    </header-simple-title-with-sub>
    <div
      v-if="table"
      class="container flex flex-col mx-auto grow"
      :class="{
        content: table.length,
      }"
    >
      <!-- <fetch-overlay :fetching="pending" /> -->

      <div v-if="table.length" class="relative mx-auto xl:rounded-lg w-full max-w-max">
        <table class="table table-sm px-2 whitespace-nowrap">
          <thead>
            <tr class="bg-base-100">
              <th>Rank</th>
              <th>Flag</th>
              <th>Player</th>
              <th class="px-4 font-semibold text-center">
                {{
                  t(localeKey.rankingSystem(selected.rankingSystem))
                }}
              </th>
              <th class="px-4 font-medium text-center">
                {{ t('global.accuracy') }}
              </th>
              <th class="px-4 font-medium text-center">
                {{ t('global.play-count') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <leaderboard-user-table
              v-for="(item, index) in table"
              :key="index"
              :user="item.user"
              :in-this-leaderboard="item.inThisLeaderboard"
              :sort="selected.rankingSystem"
            />
          </tbody>
        </table>
      </div>
      <div
        v-else-if="!pending"
        class="pb-10 my-auto text-gbase-900 dark:text-gbase-100 grow"
      >
        <h1 class="text-xl font-semibold text-center">
          {{ t('no-score') }}
        </h1>
        <h2 class="text-sm font-semibold text-center opacity-60">
          {{ t('no-score-alt') }}
        </h2>
      </div>
      <div class="join mx-auto outline outline-2">
        <input v-for="i in 5" :key="`pagination-${i}`" class="join-item btn btn-ghost checked:outline outline-2" type="radio" name="options" :aria-label="i.toString()" @click="reloadPage(i)">
      </div>
      <div class="flex py-4">
        <!-- <t-tabs
          :model-value="page"
          class="mx-auto items-baseline"
          size="lg"
          @update:model-value="v => reloadPage(v)"
        >
          <t-tab
            v-for="i in 5"
            :key="`pagination-${i}`"
            :value="i"
            class="bigger-when-active"
          >
            {{ i }}
          </t-tab>
        </t-tabs> -->
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.bigger-when-active:active {
  @apply font-semibold drop-shadow-md border-2 rounded-lg
}
</style>
