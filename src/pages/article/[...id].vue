<script setup lang="ts">
const route = useRoute('article-id')

const id = route.params.id
if (!id) {
  throw new Error('id required')
}

const app$ = useNuxtApp()
const content = await app$.$client.article.getRendered.query(id)

const { t } = useI18n()
</script>

<i18n lang="yaml">
en-GB:
  edit: Edit

zh-CN:
  edit: 编辑
</i18n>

<template>
  <section class="container mx-auto with-editor relative">
    <content-render v-bind="content" />
    <button v-if="content.access.write" class="btn btn-neutral d-flex gap-1 absolute top-0 right-0">
      {{ t('edit') }} <icon name="ic:round-edit-note" class="w-5 h-5" />
    </button>
  </section>
</template>

<style lang="postcss">
.with-editor.editable {
  & .edit {
    visibility: hidden;
    pointer-events: none;
  }

  &:hover {
    & .edit {
      visibility: visible;
      pointer-events: all;
    }
  }
}
</style>

<style src="@/components/content/styles/typography.scss" lang="scss"></style>
