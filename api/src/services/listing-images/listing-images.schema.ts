import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ListingImagesService } from './listing-images.class'

export const listingImagesSchema = Type.Object({
  id: Type.Number(),
  listing_id: Type.Number(),
  filename: Type.String(),
  position: Type.Number(),
  mime_type: Type.String(),
  size_bytes: Type.Number()
}, { $id: 'ListingImages', additionalProperties: false })
export type ListingImages = Static<typeof listingImagesSchema>
export const listingImagesValidator = getValidator(listingImagesSchema, dataValidator)
export const listingImagesResolver = resolve<ListingImagesQuery, HookContext<ListingImagesService>>({})
export const listingImagesExternalResolver = resolve<ListingImages, HookContext<ListingImagesService>>({})

export const listingImagesDataSchema = Type.Pick(listingImagesSchema, ['listing_id', 'filename', 'position', 'mime_type', 'size_bytes'], { $id: 'ListingImagesData' })
export type ListingImagesData = Static<typeof listingImagesDataSchema>
export const listingImagesDataValidator = getValidator(listingImagesDataSchema, dataValidator)
export const listingImagesDataResolver = resolve<ListingImagesData, HookContext<ListingImagesService>>({})
export const listingImagesPatchSchema = Type.Partial(Type.Pick(listingImagesSchema, ['position']), { $id: 'ListingImagesPatch' })
export type ListingImagesPatch = Static<typeof listingImagesPatchSchema>
export const listingImagesPatchValidator = getValidator(listingImagesPatchSchema, dataValidator)
export const listingImagesPatchResolver = resolve<ListingImagesPatch, HookContext<ListingImagesService>>({})
export const listingImagesQueryProperties = Type.Pick(listingImagesSchema, ['id', 'listing_id', 'position'])
export const listingImagesQuerySchema = Type.Intersect([querySyntax(listingImagesQueryProperties), Type.Object({}, { additionalProperties: false })], { additionalProperties: false })
export type ListingImagesQuery = Static<typeof listingImagesQuerySchema>
export const listingImagesQueryValidator = getValidator(listingImagesQuerySchema, queryValidator)
export const listingImagesQueryResolver = resolve<ListingImagesQuery, HookContext<ListingImagesService>>({})
