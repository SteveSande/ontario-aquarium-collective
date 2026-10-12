import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { PostsCreateService } from './posts-create.class'
import { postsDataSchema, postsSchema } from '../posts/posts.schema'

const imageSchema = Type.Object({
  id: Type.Number(), post_id: Type.Number(), filename: Type.String(), position: Type.Number(),
  mime_type: Type.String(), size_bytes: Type.Number(), url: Type.String()
})
export const postsCreateSchema = Type.Object({ post: postsSchema, images: Type.Array(imageSchema, { maxItems: 6 }) }, { $id: 'PostsCreate' })
export type PostsCreate = Static<typeof postsCreateSchema>
export const postsCreateResolver = resolve<PostsCreate, HookContext<PostsCreateService>>({})
export const postsCreateExternalResolver = resolve<PostsCreate, HookContext<PostsCreateService>>({})

export const postsCreateDataSchema = Type.Pick(postsDataSchema, ['text', 'description', 'price', 'location'], { $id: 'PostsCreateData' })
export type PostsCreateData = Static<typeof postsCreateDataSchema>
export const postsCreateDataValidator = getValidator(postsCreateDataSchema, dataValidator)
export const postsCreateDataResolver = resolve<PostsCreateData, HookContext<PostsCreateService>>({})
