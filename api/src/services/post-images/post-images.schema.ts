// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { PostImagesService } from './post-images.class'

// Main data model schema
export const postImagesSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'PostImages', additionalProperties: false }
)
export type PostImages = Static<typeof postImagesSchema>
export const postImagesValidator = getValidator(postImagesSchema, dataValidator)
export const postImagesResolver = resolve<PostImagesQuery, HookContext<PostImagesService>>({})

export const postImagesExternalResolver = resolve<PostImages, HookContext<PostImagesService>>({})

// Schema for creating new entries
export const postImagesDataSchema = Type.Pick(postImagesSchema, ['text'], {
  $id: 'PostImagesData'
})
export type PostImagesData = Static<typeof postImagesDataSchema>
export const postImagesDataValidator = getValidator(postImagesDataSchema, dataValidator)
export const postImagesDataResolver = resolve<PostImagesData, HookContext<PostImagesService>>({})

// Schema for updating existing entries
export const postImagesPatchSchema = Type.Partial(postImagesSchema, {
  $id: 'PostImagesPatch'
})
export type PostImagesPatch = Static<typeof postImagesPatchSchema>
export const postImagesPatchValidator = getValidator(postImagesPatchSchema, dataValidator)
export const postImagesPatchResolver = resolve<PostImagesPatch, HookContext<PostImagesService>>({})

// Schema for allowed query properties
export const postImagesQueryProperties = Type.Pick(postImagesSchema, ['id', 'text'])
export const postImagesQuerySchema = Type.Intersect(
  [
    querySyntax(postImagesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type PostImagesQuery = Static<typeof postImagesQuerySchema>
export const postImagesQueryValidator = getValidator(postImagesQuerySchema, queryValidator)
export const postImagesQueryResolver = resolve<PostImagesQuery, HookContext<PostImagesService>>({})
