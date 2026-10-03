// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Posts, PostsData, PostsPatch, PostsQuery } from './posts.schema'

export type { Posts, PostsData, PostsPatch, PostsQuery }

export interface PostsParams extends KnexAdapterParams<PostsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class PostsService<ServiceParams extends Params = PostsParams> extends KnexService<
  Posts,
  PostsData,
  PostsParams,
  PostsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'posts'
  }
}
