import type { idTransformable } from './@extends'
import type { Relationship } from '~/def'
import type { UserEssential } from '~/def/user'
import type { UserRelationship } from '~/def/user-relationship'

export interface UserRelationProvider<Id> extends idTransformable {
  get(query: { user: { id: Id } }): PromiseLike<Array<UserEssential<Id> & UserRelationship>>
  getOne(
    fromUser: { id: Id },
    toUser: { id: Id }
  ): PromiseLike<Relationship | void>
  removeOne(query: {
    fromUser: UserEssential<Id>
    targetUser: UserEssential<Id>
    type: Relationship
  }): PromiseLike<void>
  count(query: {
    user: UserEssential<Id>
    type: Relationship
  }): PromiseLike<number>
}
