// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  postImagesDataValidator,
  postImagesPatchValidator,
  postImagesQueryValidator,
  postImagesResolver,
  postImagesExternalResolver,
  postImagesDataResolver,
  postImagesPatchResolver,
  postImagesQueryResolver
} from './post-images.schema'

import type { Application } from '../../declarations'
import { PostImagesService, getOptions } from './post-images.class'
import { postImagesPath, postImagesMethods } from './post-images.shared'

export * from './post-images.class'
export * from './post-images.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const postImages = (app: Application) => {
  // Register our service on the Feathers application
  app.use(postImagesPath, new PostImagesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: postImagesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(postImagesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(postImagesExternalResolver),
        schemaHooks.resolveResult(postImagesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(postImagesQueryValidator),
        schemaHooks.resolveQuery(postImagesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(postImagesDataValidator),
        schemaHooks.resolveData(postImagesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(postImagesPatchValidator),
        schemaHooks.resolveData(postImagesPatchResolver)
      ],
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
    [postImagesPath]: PostImagesService
  }
}
