import { Logger as BaseLogger } from '$base/log'

export const Logger = BaseLogger.child({ label: 'bancho.py', backend: 'bancho.py' })
