import { array, date, literal, nativeEnum, number, object, string, tuple, union } from 'zod'

import { zodTipTapJSONContent } from '~/server/trpc/shapes'
import { Scope, UserPrivilege } from '~/def/user'

export const v = 2 as const

export type TWriteAccess = typeof WriteAccess[keyof typeof WriteAccess]
export const WriteAccess = {
  Staff: UserPrivilege.Staff,
  Moderator: UserPrivilege.Moderator,
  BeatmapNominator: UserPrivilege.BeatmapNominator,
} as const

export const writeAccess = nativeEnum(WriteAccess)

export type TReadAccess = typeof ReadAccess[keyof typeof ReadAccess]
export const ReadAccess = {
  ...WriteAccess,
  Public: Scope.Public,
} as const
export const readAccess = nativeEnum(ReadAccess)

export const defaultPrivilege = {
  read: [ReadAccess.Public],
  write: [WriteAccess.Staff],
}
export const ownerId = union([string().trim(), number()])

export const contentSchema = object({
  json: zodTipTapJSONContent,
})
  .and(
    object({
      html: string(),
      dynamic: literal(false),
    })
      .or(object({
        dynamic: literal(true),
      }))
  )

export const metaSchema = object({
  privilege: object({
    read: array(readAccess),
    write: array(writeAccess),
  }).default(defaultPrivilege),
  owner: ownerId,
  created: tuple([ownerId, date()]),
  lastUpdated: tuple([ownerId, date()]),
})

export const schema = object({
  v: literal(v),
})
  .and(metaSchema)
  .and(contentSchema)

export const parse = schema.parse
