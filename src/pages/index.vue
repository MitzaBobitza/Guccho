<script setup lang="ts">
import { useSession } from '~/store/session'

definePageMeta({
  layout: 'hero',
})
const session = useSession()
const config = useAppConfig()
useHead({
  titleTemplate: `${config.title}`,
})
const { t } = useI18n()
</script>

<i18n lang="yaml">
en-GB:
  to-userpage: to my profile

zh-CN:
  to-userpage: 用户页面
</i18n>

<template>
  <div class="custom-container heading">
    <div class="content p-8">
      <div class="mb-6">
        <h1 class="mb-2 text-4xl font-bold text-center">
          {{ config.title }}
        </h1>
        <h2 class="font-semibold px-2 sm:px-0 h-sub text-md sm:text-left whitespace-pre-line">
          {{ t('landing.content', { title: config.title }) }}
        </h2>
      </div>
      <div class="grid grid-cols-2 gap-2 justify-center">
        <template v-if="session.$state.loggedIn">
          <t-nuxt-link-locale-button
            :to="{
              name: 'user-handle',
              params: { handle: session.$state.userId },
            }"
            variant="primary"
          >
            {{ t('to-userpage') }}
          </t-nuxt-link-locale-button>
          <t-nuxt-link-locale-button :to="{ name: 'me-settings' }" variant="secondary">
            {{ t('titles.settings').toLocaleLowerCase() }}
          </t-nuxt-link-locale-button>
        </template>
        <template v-else>
          <t-nuxt-link-locale-button :to="{ name: 'auth-login' }" variant="primary">
            {{ t('global.login') }}
          </t-nuxt-link-locale-button>
          <t-nuxt-link-locale-button
            :to="{ name: 'auth-register' }"
            variant="secondary"
          >
            {{ t('global.register') }}
          </t-nuxt-link-locale-button>
        </template>
      </div>
    </div>

    <div class="hidden mascot lg:block">
      <img
        src="/mascot/riru.png"
        style="max-height: 70vmin"
        alt="riru Mascot"
      >
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.h-sub {
  max-width: 32rem;
}
.heading {
  @apply relative flex items-center justify-between px-4 lg:px-0 mx-auto my-auto text-left text-gbase-900 dark:text-gbase-100;
  /* &::before,
  &::after {
    content: "";
    @apply -z-10 opacity-50;
    @apply lg:absolute lg:top-[30%] lg:bottom-[30%] lg:left-0 lg:right-0;
    @apply lg:bg-gradient-to-r lg:from-gbase-500/5 lg:to-transparent;
    @apply lg:rounded-3xl;
  }
  &::before {
    @apply lg:blur
  } */
}
</style>
