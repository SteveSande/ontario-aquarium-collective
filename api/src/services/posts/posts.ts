// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { rm } from 'fs/promises'
import path from 'path'

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
      all: [schemaHooks.resolveExternal(postsExternalResolver), schemaHooks.resolveResult(postsResolver)],
      create: [authenticate('jwt')],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt'), async (context, next) => {
        await next()
        const postId = Array.isArray(context.result) ? undefined : (context.result as { id?: number } | undefined)?.id
        if (postId !== undefined) {
          await context.app.get('sqliteClient')('post-images').where({ post_id: postId }).del()
          const root = path.resolve(process.env.POST_IMAGE_DIRECTORY || './uploads/post-images')
          await rm(path.join(root, String(postId)), { recursive: true, force: true })
        }
      }]
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
