// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { rm } from 'fs/promises'
import path from 'path'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  listingsDataValidator,
  listingsPatchValidator,
  listingsQueryValidator,
  listingsResolver,
  listingsExternalResolver,
  listingsDataResolver,
  listingsPatchResolver,
  listingsQueryResolver
} from './listings.schema'

import type { Application } from '../../declarations'
import { ListingsService, getOptions } from './listings.class'
import { listingsPath, listingsMethods } from './listings.shared'

export * from './listings.class'
export * from './listings.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const listings = (app: Application) => {
  // Register our service on the Feathers application
  app.use(listingsPath, new ListingsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: listingsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(listingsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(listingsExternalResolver), schemaHooks.resolveResult(listingsResolver)],
      create: [authenticate('jwt')],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt'), async (context, next) => {
        await next()
        const listingId = Array.isArray(context.result) ? undefined : (context.result as { id?: number } | undefined)?.id
        if (listingId !== undefined) {
          await context.app.get('sqliteClient')('listing-images').where({ listing_id: listingId }).del()
          const root = path.resolve(process.env.LISTING_IMAGE_DIRECTORY || './uploads/listing-images')
          await rm(path.join(root, String(listingId)), { recursive: true, force: true })
        }
      }]
    },
    before: {
      all: [schemaHooks.validateQuery(listingsQueryValidator), schemaHooks.resolveQuery(listingsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(listingsDataValidator), schemaHooks.resolveData(listingsDataResolver)],
      patch: [schemaHooks.validateData(listingsPatchValidator), schemaHooks.resolveData(listingsPatchResolver)],
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
    [listingsPath]: ListingsService
  }
}
