import { Forbidden } from '@feathersjs/errors'

import type { HookContext } from '../declarations'
import type { UserService } from '../services/users/users.class'

export const requireAdmin = async (context: HookContext<UserService>) => {
  if (context.params.provider && context.params.user?.system_role !== 'admin') {
    throw new Forbidden('Admin access required')
  }
}
