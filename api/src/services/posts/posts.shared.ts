// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Posts, PostsData, PostsPatch, PostsQuery, PostsService } from './posts.class'

export type { Posts, PostsData, PostsPatch, PostsQuery }

export type PostsClientService = Pick<PostsService<Params<PostsQuery>>, (typeof postsMethods)[number]>

export const postsPath = 'posts'

export const postsMethods: Array<keyof PostsService> = ['find', 'get', 'create', 'patch', 'remove']

export const postsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(postsPath, connection.service(postsPath), {
    methods: postsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [postsPath]: PostsClientService
  }
}
