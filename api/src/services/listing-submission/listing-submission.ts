import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import type { Application } from '../../declarations'
import { ListingSubmissionService, getOptions } from './listing-submission.class'
import { listingSubmissionDataValidator, listingSubmissionDataResolver, listingSubmissionResolver, listingSubmissionExternalResolver } from './listing-submission.schema'
import { listingSubmissionPath, listingSubmissionMethods } from './listing-submission.shared'

export * from './listing-submission.class'
export * from './listing-submission.schema'

export const listingSubmission = (app: Application) => {
  app.use(listingSubmissionPath, new ListingSubmissionService(getOptions(app)), { methods: listingSubmissionMethods, events: [] })
  app.service(listingSubmissionPath).hooks({
    around: { all: [authenticate('jwt'), schemaHooks.resolveExternal(listingSubmissionExternalResolver), schemaHooks.resolveResult(listingSubmissionResolver)] },
    before: { create: [schemaHooks.validateData(listingSubmissionDataValidator), schemaHooks.resolveData(listingSubmissionDataResolver)] }
  })
}

declare module '../../declarations' {
  interface ServiceTypes { [listingSubmissionPath]: ListingSubmissionService }
}
