<script setup lang="ts">
import type { UserEssential } from '~/def/user'
import type { UserRelationship } from '~/def/user-relationship'
import { Relationship } from '~/def'
import { useSession } from '~/store/session'

const app$ = useNuxtApp()
const session = useSession()

if (!session.$state.loggedIn) {
  await navigateTo({
    name: 'auth-login',
    query: {
      back: '1',
    },
  })
}
const relations = shallowRef(await app$.$client.me.relations.query())
const config = useAppConfig()
const { t } = useI18n()

useHead({
  titleTemplate: `Friends - ${config.title}`,
})
if (!relations.value) {
  throw new Error(t('user-not-found'))
}

const errorMessage = shallowRef('')

onErrorCaptured((err) => {
  errorMessage.value = err.message || t('err-message')
})
function haveRelation(relation: Relationship, user: UserEssential<string> & UserRelationship) {
  return user.relationship.includes(relation)
}
const pendingUser = reactive(new Set<string>())
async function toggleRelation(type: Relationship, user: UserEssential<string> & UserRelationship) {
  pendingUser.add(user.id)
  try {
    if (haveRelation(type, user)) {
      await app$.$client.me.removeOneRelation.mutate({ type, target: user.id })
      user.relationship = user.relationship.filter(k => k !== type)
    }
    else {
      await app$.$client.me.addOneRelation.mutate({ type, target: user.id })
      user.relationship.push(type)
    }
    pendingUser.delete(user.id)
  }
  catch (e) {
    pendingUser.delete(user.id)
  }
}

const toggleFriend = toggleRelation.bind(null, Relationship.Friend)
const isFriend = haveRelation.bind(null, Relationship.Friend)
// const toggleBlock = toggleRelation.bind(null, 'block')
// const isBlocked = haveRelation.bind(null, 'block')
</script>

<i18n lang="yaml">
en-GB:
  loading: Loading...
  err-message: something went wrong.
  user-not-found: user not exists
  remove-friend: remove friend
  regret: regret
zh-CN:
  loading: 加载中...
  err-message: 出现了些小问题。
  user-not-found: 该用户不存在
  remove-friend: 删除该好友
  regret: 后悔了
</i18n>

<template>
  <div class="container pt-24 mx-auto custom-container">
    <suspense>
      <template #fallback>
        <div>
          {{ errorMessage || t('loading') }}
        </div>
      </template>
      <div class="mx-auto user-list">
        <div
          v-for="user in relations"
          :key="`relation-@${user.safeName}`"
          class="w-full p-2 user-list-item"
        >
          <div
            class="flex items-center justify-center gap-2 md:justify-start face"
          >
            <div class="relative z-10 mask mask-squircle hoverable">
              <img
                :src="user.avatarSrc"
                class="pointer-events-none w-14 md:w-[4em]"
              >
            </div>
            <div class="grow">
              <h1 class="text-2xl text-left md:text-3xl">
                {{ user.name }}
              </h1>
              <div class="flex justify-between w-full items-top">
                <nuxt-link-locale
                  :key="`${user.id}:${user.relationship.join('-')}`"
                  class="text-lg text-left underline md:text-2xl decoration-sky-500 text-gbase-600 dark:text-gbase-300 hover:text-gbase-500"
                  :to="{
                    name: 'user-handle',
                    params: {
                      handle: `@${user.safeName}`,
                    },
                  }"
                >
                  @{{ user.safeName }}
                </nuxt-link-locale>
                <div class="flex gap-2 actions">
                  <!-- <t-button variant="info" size="xs" class="md:btn-sm">
                    chat
                  </t-button> -->
                  <t-button :loading="pendingUser.has(user.id)" variant="warning" size="xs" class="md:btn-sm" @click="toggleFriend(user)">
                    {{ pendingUser.has(user.id) ? '' : isFriend(user) ? t('remove-friend') : t('regret') }}
                  </t-button>
                  <!-- <t-button :loading="pendingUser.has(user.id)" variant="warning" size="xs" class="md:btn-sm" @click="toggleBlock(user)">
                    {{ pendingUser.has(user.id) ? '' : isBlocked(user) ? 'remove block' : 'regret' }}
                  </t-button> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </suspense>
  </div>
</template>

<style lang="scss">
.user-list {
  .user-list-item {
    .face {
      @apply transition-all;
      @apply drop-shadow-sm;
    }
    .actions {
      filter: blur(0.2em) opacity(0);
      transform: scale(1.05);
      @apply transition-all;
    }
    &:hover {
      .face {
        transform: translateY(-0.2em);
        @apply drop-shadow-xl;
        @apply transition-all;
      }
      .actions {
        transform: scale(1) translateY(-0.2em);
        filter: blur(0) opacity(1);
        @apply transition-all;
      }
    }

    @apply border-b-2 border-gbase-500/30;
  }
  @apply grid lg:grid-cols-2 gap-x-8;
}
</style>
