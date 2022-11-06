import type { TRPCError } from '@trpc/server'
import { defineStore } from 'pinia'
import md5 from 'md5'
import { IdType } from '~/adapters/bancho.py/config'
import type { UserFull } from '~/prototyping/types/user'
import { useClient } from '#imports'

/** counterストア */
export const useSession = defineStore('session', {
  state: (): {
    loggedIn: boolean,
    userId?: IdType,
    _data: Partial<Omit<UserFull<IdType>, 'statistics'>>,
  } => ({
    loggedIn: false,
    _data: {}
  }),
  actions: {
    async login (handle: string, passwordText: string) {
      const md5HashedPassword = md5(passwordText)
      return await this.loginHashed(handle, md5HashedPassword)
    },
    async loginHashed (handle: string, md5HashedPassword: string) {
      const result = await useClient().query('session.login', { handle, md5HashedPassword })
      if (!result) { return false }

      this.$patch({
        loggedIn: true,
        userId: result.user.id,
        _data: result.user
      })
      return true
    },
    async retrieve () {
      try {
        const result = await useClient().query('session.retrieve')
        if (!result) { return }
        if (!result.user) { return }
        this.$patch({
          loggedIn: true,
          userId: result.user.id,
          _data: result.user
        })
        return true
      } catch (err) {
        if ((err as TRPCError)?.code === 'NOT_FOUND') {
          this.$reset()
        }
        return false
      }
    }
  }
})