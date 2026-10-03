// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { PostImages, PostImagesData, PostImagesPatch, PostImagesQuery } from './post-images.schema'

export type { PostImages, PostImagesData, PostImagesPatch, PostImagesQuery }

export interface PostImagesParams extends KnexAdapterParams<PostImagesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class PostImagesService<ServiceParams extends Params = PostImagesParams> extends KnexService<
  PostImages,
  PostImagesData,
  PostImagesParams,
  PostImagesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'post-images'
  }
}
