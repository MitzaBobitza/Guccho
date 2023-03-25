import { cpus } from 'node:os'
import { currentLoad, mem } from 'systeminformation'
import { pick } from '~/utils'
function calcPercentageLoad(usage: number, time: ReturnType<typeof process['hrtime']>) {
  return 100 * (usage / (time[0] * 1e9 + time[1]))
}
export class ServiceStatusProvider {
  lastTime = process.hrtime()
  lastUsage = process.cpuUsage()
  interval = 2000

  coreCount = cpus().length
  processUsage: {
    system: number
    user: number
    current: number
  } = {
      system: 0,
      user: 0,
      current: 0,
    }

  constructor() {
    setInterval(this.collectLoad.bind(this), this.interval)
  }

  async public() {
    const [load, memory] = await Promise.all([this.load(), this.memory()])
    return {
      load,
      memory,
    }
  }

  async load() {
    const load = await currentLoad()
    return {
      app: {
        web: this.processUsage,
      },
      system: {
        avg: load.avgLoad,
        current: load.currentLoad,
        user: load.currentLoadUser,
        system: load.currentLoadSystem,
        idle: load.currentLoadIdle,
        // Lower priority
        nice: load.currentLoadNice,
        // cores: load.cpus.map(core => ({
        //   current: core.load,
        //   user: core.loadUser,
        //   system: core.loadSystem,
        //   // Lower priority
        //   nice: core.loadNice,
        // })),
      },
    }
  }

  collectLoad() {
    const durationUsage = process.cpuUsage(this.lastUsage)
    const duration = process.hrtime(this.lastTime)

    this.lastTime = process.hrtime()
    this.lastUsage = process.cpuUsage()

    const calc = (a: number, b: [number, number]) => calcPercentageLoad(a, b) / this.coreCount

    this.processUsage = {
      user: calc(durationUsage.user, duration) * 10000,
      system: calc(durationUsage.system, duration) * 10000,
      get current() {
        return this.user + this.system
      },
    }
  }

  async memory() {
    const m = await mem()

    return {
      system: pick(m, [
        'total',
        'available',
        'free',
        'used',
        'active',
        'buffcache',
      ]),
    }
  }

  async ready() {
    return false
  }
}