// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ListingsService } from './listings.class'

// Main data model schema
export const listingsSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    description: Type.String(),
    price: Type.Number({ minimum: 0 }),
    location: Type.String({ minLength: 1, maxLength: 20, pattern: '\\S' }),
    owner_id: Type.Number()
  },
  { $id: 'Listings', additionalProperties: false }
)
export type Listings = Static<typeof listingsSchema>
export const listingsValidator = getValidator(listingsSchema, dataValidator)
export const listingsResolver = resolve<ListingsQuery, HookContext<ListingsService>>({})

export const listingsExternalResolver = resolve<Listings, HookContext<ListingsService>>({})

// Schema for creating new entries
export const listingsDataSchema = Type.Object(
  {
    ...Type.Pick(listingsSchema, ['text', 'description', 'price', 'location']).properties,
    ...Type.Partial(Type.Pick(listingsSchema, ['owner_id'])).properties
  },
  { $id: 'ListingsData', additionalProperties: false }
)
export type ListingsData = Static<typeof listingsDataSchema>
export const listingsDataValidator = getValidator(listingsDataSchema, dataValidator)
export const listingsDataResolver = resolve<ListingsData, HookContext<ListingsService>>({
  owner_id: async (value, listing, context) => context.params.user?.id ?? value
})

// Schema for updating existing entries
export const listingsPatchSchema = Type.Partial(Type.Pick(listingsSchema, ['text', 'description', 'price', 'location']), {
  $id: 'ListingsPatch'
})
export type ListingsPatch = Static<typeof listingsPatchSchema>
export const listingsPatchValidator = getValidator(listingsPatchSchema, dataValidator)
export const listingsPatchResolver = resolve<ListingsPatch, HookContext<ListingsService>>({})

// Schema for allowed query properties
export const listingsQueryProperties = Type.Pick(listingsSchema, ['id', 'text', 'description', 'price', 'location', 'owner_id'])
export const listingsQuerySchema = Type.Intersect(
  [
    querySyntax(listingsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ListingsQuery = Static<typeof listingsQuerySchema>
export const listingsQueryValidator = getValidator(listingsQuerySchema, queryValidator)
export const listingsQueryResolver = resolve<ListingsQuery, HookContext<ListingsService>>({
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
