import { randomUUID } from 'crypto'
import { mkdir, readFile, rename, rm } from 'fs/promises'
import path from 'path'
import { BadRequest, NotAuthenticated } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import type { Application } from '../../declarations'
import type { PostsCreate, PostsCreateData } from './posts-create.schema'

export type { PostsCreate, PostsCreateData }

export interface UploadedImage { filepath: string }
export interface PostsCreateParams extends Params {
  uploadedImages?: UploadedImage[]
}

const maxImageBytes = 10 * 1024 * 1024

function imageType(bytes: Buffer): { mime: string; extension: string } | undefined {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { mime: 'image/jpeg', extension: 'jpg' }
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { mime: 'image/png', extension: 'png' }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', extension: 'webp' }
}

export class PostsCreateService {
  constructor(private app: Application) {}

  async create(data: PostsCreateData, params?: PostsCreateParams): Promise<PostsCreate> {
    const user = params?.user
    if (!user) throw new NotAuthenticated()
    const files = params?.uploadedImages ?? []
    if (files.length > 6) throw new BadRequest('Supply at most six images')

    const checked = await Promise.all(files.map(async file => {
      const bytes = await readFile(file.filepath)
      const type = imageType(bytes)
      if (!type || bytes.length === 0 || bytes.length > maxImageBytes) throw new BadRequest('Images must be JPEG, PNG, or WebP and at most 10 MB each')
      return { file, type, size: bytes.length }
    }))

    const root = path.resolve(process.env.POST_IMAGE_DIRECTORY || './uploads/post-images')
    const writtenFiles: string[] = []
    try {
      return await this.app.get('sqliteClient').transaction(async trx => {
        const serviceParams = { user, transaction: { trx, starting: false } }
        const post = await this.app.service('posts').create(data, serviceParams)
        const postId = post.id
        const directory = path.join(root, String(postId))
        await mkdir(directory, { recursive: true })
        const images = []
        for (const [position, image] of checked.entries()) {
          const filename = `${randomUUID()}.${image.type.extension}`
          const destination = path.join(directory, filename)
          await rename(image.file.filepath, destination)
          writtenFiles.push(destination)
          const row = await this.app.service('post-images').create({ post_id: postId, filename, position, mime_type: image.type.mime, size_bytes: image.size }, serviceParams)
          images.push({ ...row, url: `/post-images/${postId}/${filename}` })
        }
        return { post, images }
      })
    } catch (error) {
      await Promise.all(writtenFiles.map(file => rm(file, { force: true })))
      throw error
    }
  }
}

export const getOptions = (app: Application) => app
