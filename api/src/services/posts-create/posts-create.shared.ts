// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { ClientApplication } from '../../client'
import type { PostsCreate, PostsCreateData, PostsCreateService } from './posts-create.class'

export type { PostsCreate, PostsCreateData }

export type PostsCreateClientService = Pick<PostsCreateService, (typeof postsCreateMethods)[number]>

export const postsCreatePath = 'posts-create'

export const postsCreateMethods: Array<keyof PostsCreateService> = ['create']

export const postsCreateClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(postsCreatePath, connection.service(postsCreatePath), {
    methods: postsCreateMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [postsCreatePath]: PostsCreateClientService
  }
}
