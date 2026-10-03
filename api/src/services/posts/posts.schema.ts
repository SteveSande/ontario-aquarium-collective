// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { PostsService } from './posts.class'

// Main data model schema
export const postsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    description: Type.String(),
    price: Type.Number({ minimum: 0 }),
    location: Type.String({ minLength: 1, maxLength: 20, pattern: '\\S' }),
    owner_id: Type.Number()
  },
  { $id: 'Posts', additionalProperties: false }
)
export type Posts = Static<typeof postsSchema>
export const postsValidator = getValidator(postsSchema, dataValidator)
export const postsResolver = resolve<PostsQuery, HookContext<PostsService>>({})

export const postsExternalResolver = resolve<Posts, HookContext<PostsService>>({})

// Schema for creating new entries
export const postsDataSchema = Type.Object(
  {
    ...Type.Pick(postsSchema, ['text', 'description', 'price', 'location']).properties,
    ...Type.Partial(Type.Pick(postsSchema, ['owner_id'])).properties
  },
  { $id: 'PostsData', additionalProperties: false }
)
export type PostsData = Static<typeof postsDataSchema>
export const postsDataValidator = getValidator(postsDataSchema, dataValidator)
export const postsDataResolver = resolve<PostsData, HookContext<PostsService>>({
  owner_id: async (value, post, context) => context.params.user?.id ?? value
})

// Schema for updating existing entries
export const postsPatchSchema = Type.Partial(Type.Pick(postsSchema, ['text', 'description', 'price', 'location']), {
  $id: 'PostsPatch'
})
export type PostsPatch = Static<typeof postsPatchSchema>
export const postsPatchValidator = getValidator(postsPatchSchema, dataValidator)
export const postsPatchResolver = resolve<PostsPatch, HookContext<PostsService>>({})

// Schema for allowed query properties
export const postsQueryProperties = Type.Pick(postsSchema, ['id', 'text', 'description', 'price', 'location', 'owner_id'])
export const postsQuerySchema = Type.Intersect(
  [
    querySyntax(postsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type PostsQuery = Static<typeof postsQuerySchema>
export const postsQueryValidator = getValidator(postsQuerySchema, queryValidator)
export const postsQueryResolver = resolve<PostsQuery, HookContext<PostsService>>({
  owner_id: async (value, query, context) => {
    if (
      context.params.provider &&
      (context.method === 'patch' || context.method === 'remove') &&
      context.params.user?.system_role !== 'admin'
    ) {
      return context.params.user?.id
    }

    return value
  }
})
