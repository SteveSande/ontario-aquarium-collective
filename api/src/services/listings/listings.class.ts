// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Listings, ListingsData, ListingsPatch, ListingsQuery } from './listings.schema'

export type { Listings, ListingsData, ListingsPatch, ListingsQuery }

export interface ListingsParams extends KnexAdapterParams<ListingsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ListingsService<ServiceParams extends Params = ListingsParams> extends KnexService<
  Listings,
  ListingsData,
  ListingsParams,
  ListingsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'listings'
  }
}
