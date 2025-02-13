import { router as _router, publicProcedure as p } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { ServiceStatusProvider } from '$active/server'

const sp = new ServiceStatusProvider()
export const router = _router({
  ready: p.query(sp.ready.bind(sp)),
  public: p.query(sp.public.bind(sp)),
  config: adminProcedure.query(sp.config.bind(sp)),
})
