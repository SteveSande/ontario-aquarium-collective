import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { PostImagesService } from './post-images.class'

export const postImagesSchema = Type.Object({
  id: Type.Number(),
  post_id: Type.Number(),
  filename: Type.String(),
  position: Type.Number(),
  mime_type: Type.String(),
  size_bytes: Type.Number()
}, { $id: 'PostImages', additionalProperties: false })
export type PostImages = Static<typeof postImagesSchema>
export const postImagesValidator = getValidator(postImagesSchema, dataValidator)
export const postImagesResolver = resolve<PostImagesQuery, HookContext<PostImagesService>>({})
export const postImagesExternalResolver = resolve<PostImages, HookContext<PostImagesService>>({})

export const postImagesDataSchema = Type.Pick(postImagesSchema, ['post_id', 'filename', 'position', 'mime_type', 'size_bytes'], { $id: 'PostImagesData' })
export type PostImagesData = Static<typeof postImagesDataSchema>
export const postImagesDataValidator = getValidator(postImagesDataSchema, dataValidator)
export const postImagesDataResolver = resolve<PostImagesData, HookContext<PostImagesService>>({})
export const postImagesPatchSchema = Type.Partial(Type.Pick(postImagesSchema, ['position']), { $id: 'PostImagesPatch' })
export type PostImagesPatch = Static<typeof postImagesPatchSchema>
export const postImagesPatchValidator = getValidator(postImagesPatchSchema, dataValidator)
export const postImagesPatchResolver = resolve<PostImagesPatch, HookContext<PostImagesService>>({})
export const postImagesQueryProperties = Type.Pick(postImagesSchema, ['id', 'post_id', 'position'])
export const postImagesQuerySchema = Type.Intersect([querySyntax(postImagesQueryProperties), Type.Object({}, { additionalProperties: false })], { additionalProperties: false })
export type PostImagesQuery = Static<typeof postImagesQuerySchema>
export const postImagesQueryValidator = getValidator(postImagesQuerySchema, queryValidator)
export const postImagesQueryResolver = resolve<PostImagesQuery, HookContext<PostImagesService>>({})
