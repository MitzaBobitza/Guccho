import type { UserEssential } from '~/def/user'
import { UserPrivilege } from '~/def/user'

// https://hypercolor.dev/
export default function (user: UserEssential<unknown>) {
  const roles = user.roles
  const classNames = ['text-transparent bg-clip-text animate-text']

  if (roles.includes(UserPrivilege.Owner)) {
    return [
      ...classNames,
      'bg-gradient-to-b from-yellow-300 via-pink-500 to-red-400 dark:from-yellow-200 dark:via-pink-300 dark:to-red-400',
    ]
  }

  if (roles.includes(UserPrivilege.Admin)) {
    return [
      ...classNames,
      'bg-gradient-to-b from-purple-200 via-purple-400 to-purple-800',
    ]
  }

  if (roles.includes(UserPrivilege.BeatmapNominator)) {
    return [
      ...classNames,
      'bg-gradient-to-b from-green-400 to-purple-500 dark:from-green-200 dark:to-purple-400',
    ]
  }

  return []
}
