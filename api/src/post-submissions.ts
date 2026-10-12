import { rm } from 'fs/promises'
import { BadRequest } from '@feathersjs/errors'
import { bodyParser } from '@feathersjs/koa'
import type { Application } from './declarations'

// Parse multipart uploads before the REST transport dispatches to posts-create.
export const postSubmissions = (app: Application) => {
  const parseMultipart = bodyParser({ multipart: true, formidable: { maxFiles: 6, maxFileSize: 10 * 1024 * 1024, maxTotalFileSize: 60 * 1024 * 1024 } })
  app.use(async (ctx: any, next: () => Promise<unknown>) => {
    if (ctx.path !== '/posts-create' || ctx.method !== 'POST') return next()
    await parseMultipart(ctx, async () => undefined)
    const uploads = ctx.request.files as Record<string, any> | undefined
    const files = uploads?.images === undefined ? [] : [uploads.images].flat()
    const temporaryFiles = files.map((file: any) => file.filepath as string)
    try {
      if (files.length > 6 || Object.keys(uploads ?? {}).some(key => key !== 'images')) throw new BadRequest('Supply at most six images in the images field')
      const fields = ctx.request.body as Record<string, unknown>
      ctx.request.body = { text: fields.text, description: fields.description, price: Number(fields.price), location: fields.location }
      ctx.feathers = { ...ctx.feathers, uploadedImages: files }
      await next()
    } finally {
      await Promise.all(temporaryFiles.map(file => rm(file, { force: true })))
    }
  })
}
