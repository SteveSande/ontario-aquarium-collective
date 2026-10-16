// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Listings, ListingsData, ListingsPatch, ListingsQuery, ListingsService } from './listings.class'

export type { Listings, ListingsData, ListingsPatch, ListingsQuery }

export type ListingsClientService = Pick<ListingsService<Params<ListingsQuery>>, (typeof listingsMethods)[number]>

export const listingsPath = 'listings'

export const listingsMethods: Array<keyof ListingsService> = ['find', 'get', 'create', 'patch', 'remove']

export const listingsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(listingsPath, connection.service(listingsPath), {
    methods: listingsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [listingsPath]: ListingsClientService
  }
}
