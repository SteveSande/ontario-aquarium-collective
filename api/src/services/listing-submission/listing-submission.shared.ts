// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { ClientApplication } from '../../client'
import type { ListingSubmission, ListingSubmissionData, ListingSubmissionService } from './listing-submission.class'

export type { ListingSubmission, ListingSubmissionData }

export type ListingSubmissionClientService = Pick<ListingSubmissionService, (typeof listingSubmissionMethods)[number]>

export const listingSubmissionPath = 'listing-submission'

export const listingSubmissionMethods: Array<keyof ListingSubmissionService> = ['create']

export const listingSubmissionClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(listingSubmissionPath, connection.service(listingSubmissionPath), {
    methods: listingSubmissionMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [listingSubmissionPath]: ListingSubmissionClientService
  }
}
