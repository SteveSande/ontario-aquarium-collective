// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { ListingImages, ListingImagesData, ListingImagesPatch, ListingImagesQuery } from './listing-images.schema'

export type { ListingImages, ListingImagesData, ListingImagesPatch, ListingImagesQuery }

export interface ListingImagesParams extends KnexAdapterParams<ListingImagesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ListingImagesService<ServiceParams extends Params = ListingImagesParams> extends KnexService<
  ListingImages,
  ListingImagesData,
  ListingImagesParams,
  ListingImagesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'listing-images'
  }
}
