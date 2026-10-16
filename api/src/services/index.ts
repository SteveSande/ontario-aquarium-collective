import { listingSubmission } from './listing-submission/listing-submission'
import { listingImages } from './listing-images/listing-images'
import { listings } from './listings/listings'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(listingSubmission)
  app.configure(listingImages)
  app.configure(listings)
  app.configure(user)
  // All services will be registered here
}
