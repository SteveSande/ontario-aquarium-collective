import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import type { HookContext } from '../../declarations'
import { dataValidator } from '../../validators'
import type { ListingSubmissionService } from './listing-submission.class'
import { listingsDataSchema, listingsSchema } from '../listings/listings.schema'

const imageSchema = Type.Object({
  id: Type.Number(), listing_id: Type.Number(), filename: Type.String(), position: Type.Number(),
  mime_type: Type.String(), size_bytes: Type.Number(), url: Type.String()
})
export const listingSubmissionSchema = Type.Object({ listing: listingsSchema, images: Type.Array(imageSchema, { maxItems: 6 }) }, { $id: 'ListingSubmission' })
export type ListingSubmission = Static<typeof listingSubmissionSchema>
export const listingSubmissionResolver = resolve<ListingSubmission, HookContext<ListingSubmissionService>>({})
export const listingSubmissionExternalResolver = resolve<ListingSubmission, HookContext<ListingSubmissionService>>({})

export const listingSubmissionDataSchema = Type.Pick(listingsDataSchema, ['text', 'description', 'price', 'location'], { $id: 'ListingSubmissionData' })
export type ListingSubmissionData = Static<typeof listingSubmissionDataSchema>
export const listingSubmissionDataValidator = getValidator(listingSubmissionDataSchema, dataValidator)
export const listingSubmissionDataResolver = resolve<ListingSubmissionData, HookContext<ListingSubmissionService>>({})
