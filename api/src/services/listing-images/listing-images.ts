// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  listingImagesDataValidator,
  listingImagesPatchValidator,
  listingImagesQueryValidator,
  listingImagesResolver,
  listingImagesExternalResolver,
  listingImagesDataResolver,
  listingImagesPatchResolver,
  listingImagesQueryResolver
} from './listing-images.schema'

import type { Application } from '../../declarations'
import { ListingImagesService, getOptions } from './listing-images.class'
import { listingImagesPath, listingImagesMethods } from './listing-images.shared'

export * from './listing-images.class'
export * from './listing-images.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const listingImages = (app: Application) => {
  // Register our service on the Feathers application
  app.use(listingImagesPath, new ListingImagesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: listingImagesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(listingImagesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(listingImagesExternalResolver),
        schemaHooks.resolveResult(listingImagesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(listingImagesQueryValidator),
        schemaHooks.resolveQuery(listingImagesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(listingImagesDataValidator),
        schemaHooks.resolveData(listingImagesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(listingImagesPatchValidator),
        schemaHooks.resolveData(listingImagesPatchResolver)
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
    [listingImagesPath]: ListingImagesService
  }
}
