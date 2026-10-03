// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  postsDataValidator,
  postsPatchValidator,
  postsQueryValidator,
  postsResolver,
  postsExternalResolver,
  postsDataResolver,
  postsPatchResolver,
  postsQueryResolver
} from './posts.schema'

import type { Application } from '../../declarations'
import { PostsService, getOptions } from './posts.class'
import { postsPath, postsMethods } from './posts.shared'

export * from './posts.class'
export * from './posts.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const posts = (app: Application) => {
  // Register our service on the Feathers application
  app.use(postsPath, new PostsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: postsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(postsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(postsExternalResolver),
        schemaHooks.resolveResult(postsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(postsQueryValidator), schemaHooks.resolveQuery(postsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(postsDataValidator), schemaHooks.resolveData(postsDataResolver)],
      patch: [schemaHooks.validateData(postsPatchValidator), schemaHooks.resolveData(postsPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [postsPath]: PostsService
  }
}
