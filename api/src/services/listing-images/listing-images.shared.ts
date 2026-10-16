// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ListingImages,
  ListingImagesData,
  ListingImagesPatch,
  ListingImagesQuery,
  ListingImagesService
} from './listing-images.class'

export type { ListingImages, ListingImagesData, ListingImagesPatch, ListingImagesQuery }

export type ListingImagesClientService = Pick<
  ListingImagesService<Params<ListingImagesQuery>>,
  (typeof listingImagesMethods)[number]
>

export const listingImagesPath = 'listing-images'

export const listingImagesMethods: Array<keyof ListingImagesService> = ['find', 'get']

export const listingImagesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(listingImagesPath, connection.service(listingImagesPath), {
    methods: listingImagesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [listingImagesPath]: ListingImagesClientService
  }
}
