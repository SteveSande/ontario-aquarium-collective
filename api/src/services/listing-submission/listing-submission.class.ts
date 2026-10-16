import { randomUUID } from 'crypto'
import { mkdir, readFile, rename, rm } from 'fs/promises'
import path from 'path'
import { BadRequest, NotAuthenticated } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import type { Application } from '../../declarations'
import type { ListingSubmission, ListingSubmissionData } from './listing-submission.schema'

export type { ListingSubmission, ListingSubmissionData }

export interface UploadedImage { filepath: string }
export interface ListingSubmissionParams extends Params {
  uploadedImages?: UploadedImage[]
}

const maxImageBytes = 10 * 1024 * 1024

function imageType(bytes: Buffer): { mime: string; extension: string } | undefined {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { mime: 'image/jpeg', extension: 'jpg' }
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { mime: 'image/png', extension: 'png' }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', extension: 'webp' }
}

export class ListingSubmissionService {
  constructor(private app: Application) {}

  async create(data: ListingSubmissionData, params?: ListingSubmissionParams): Promise<ListingSubmission> {
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

    const root = path.resolve(process.env.LISTING_IMAGE_DIRECTORY || './uploads/listing-images')
    const writtenFiles: string[] = []
    try {
      return await this.app.get('sqliteClient').transaction(async trx => {
        const serviceParams = { user, transaction: { trx, starting: false } }
        const listing = await this.app.service('listings').create(data, serviceParams)
        const listingId = listing.id
        const directory = path.join(root, String(listingId))
        await mkdir(directory, { recursive: true })
        const images = []
        for (const [position, image] of checked.entries()) {
          const filename = `${randomUUID()}.${image.type.extension}`
          const destination = path.join(directory, filename)
          await rename(image.file.filepath, destination)
          writtenFiles.push(destination)
          const row = await this.app.service('listing-images').create({ listing_id: listingId, filename, position, mime_type: image.type.mime, size_bytes: image.size }, serviceParams)
          images.push({ ...row, url: `/listing-images/${listingId}/${filename}` })
        }
        return { listing, images }
      })
    } catch (error) {
      await Promise.all(writtenFiles.map(file => rm(file, { force: true })))
      throw error
    }
  }
}

export const getOptions = (app: Application) => app
