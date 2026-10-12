import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import type { Application } from '../../declarations'
import { PostsCreateService, getOptions } from './posts-create.class'
import { postsCreateDataValidator, postsCreateDataResolver, postsCreateResolver, postsCreateExternalResolver } from './posts-create.schema'
import { postsCreatePath, postsCreateMethods } from './posts-create.shared'

export * from './posts-create.class'
export * from './posts-create.schema'

export const postsCreate = (app: Application) => {
  app.use(postsCreatePath, new PostsCreateService(getOptions(app)), { methods: postsCreateMethods, events: [] })
  app.service(postsCreatePath).hooks({
    around: { all: [authenticate('jwt'), schemaHooks.resolveExternal(postsCreateExternalResolver), schemaHooks.resolveResult(postsCreateResolver)] },
    before: { create: [schemaHooks.validateData(postsCreateDataValidator), schemaHooks.resolveData(postsCreateDataResolver)] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes { [postsCreatePath]: PostsCreateService }
}
