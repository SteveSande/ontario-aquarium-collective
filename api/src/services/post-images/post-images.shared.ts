// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  PostImages,
  PostImagesData,
  PostImagesPatch,
  PostImagesQuery,
  PostImagesService
} from './post-images.class'

export type { PostImages, PostImagesData, PostImagesPatch, PostImagesQuery }

export type PostImagesClientService = Pick<
  PostImagesService<Params<PostImagesQuery>>,
  (typeof postImagesMethods)[number]
>

export const postImagesPath = 'post-images'

export const postImagesMethods: Array<keyof PostImagesService> = ['find', 'get', 'create', 'patch', 'remove']

export const postImagesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(postImagesPath, connection.service(postImagesPath), {
    methods: postImagesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [postImagesPath]: PostImagesClientService
  }
}
