// For more information about this file see https://dove.feathersjs.com/guides/cli/client.test.html
import assert from 'assert'
import axios from 'axios'

import rest from '@feathersjs/rest-client'
import authenticationClient from '@feathersjs/authentication-client'
import { app } from '../src/app'
import { createClient } from '../src/client'
import type { UserData } from '../src/client'
import { mkdtemp, readFile, rm } from 'fs/promises'
import os from 'os'
import path from 'path'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}`

describe('application client tests', () => {
  const client = createClient(rest(appUrl).axios(axios))

  before(async () => {
    await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it('initialized the client', () => {
    assert.ok(client)
  })

  it('submits a listing and image in one request', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'listing-images-test-'))
    process.env.LISTING_IMAGE_DIRECTORY = directory
    const credentials = { email: `upload-${Date.now()}@example.com`, password: 'supersecret' }
    const user = await app.service('users').create(credentials)
    const { accessToken } = await client.authenticate({ strategy: 'local', ...credentials })
    const form = new FormData()
    form.set('text', 'Plants')
    form.set('description', 'Healthy plants')
    form.set('price', '12.5')
    form.set('location', 'Ottawa')
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])
    form.append('images', new Blob([png], { type: 'image/png' }), 'plant.png')
    try {
      const response = await fetch(`${appUrl}/listing-submission`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form })
      if (response.status !== 201) assert.fail(`${response.status}: ${await response.text()}`)
      const result = await response.json() as any
      assert.strictEqual(result.listing.owner_id, user.id)
      assert.strictEqual(result.images.length, 1)
      assert.deepStrictEqual(await readFile(path.join(directory, String(result.listing.id), result.images[0].filename)), png)
      await app.service('listings').remove(result.listing.id)
    } finally {
      delete process.env.LISTING_IMAGE_DIRECTORY
      await rm(directory, { recursive: true, force: true })
      await app.service('users').remove(user.id)
      await client.logout()
    }
  })

  it('allows only admins to create, patch, and remove users', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const userData: UserData = {
      email: `someone-${suffix}@example.com`,
      password: 'supersecret'
    }
    const adminData: UserData = { email: `admin-${suffix}@example.com`, password: 'supersecret' }
    const admin = await app.service('users').create(adminData)
    await app.get('sqliteClient')('users').where({ id: admin.id }).update({ system_role: 'admin' })
    const createdUser = await app.service('users').create(userData)

    await assert.rejects(client.service('users').create({ email: 'anonymous@example.com' }), { code: 401 })
    const publicUser = await client.service('users').get(createdUser.id)
    assert.strictEqual(publicUser.email, userData.email)
    assert.strictEqual(publicUser.password, undefined)
    const publicUsers = await client.service('users').find({ query: { id: createdUser.id } })
    assert.strictEqual(publicUsers.total, 1)

    const { user, accessToken } = await client.authenticate({
      strategy: 'local',
      ...userData
    })

    assert.ok(accessToken, 'Created access token for user')
    assert.ok(user, 'Includes user in authentication data')
    assert.strictEqual(user.password, undefined, 'Password is hidden to clients')
    assert.strictEqual(user.system_role, 'user', 'New users have the user role')

    await assert.rejects(client.service('users').create({ email: 'other@example.com' }), { code: 403 })
    await assert.rejects(client.service('users').patch(user.id, { email: 'changed@example.com' }), {
      code: 403
    })
    await assert.rejects(client.service('users').remove(user.id), { code: 403 })

    await client.logout()

    await client.authenticate({ strategy: 'local', ...adminData })
    const managed = await client.service('users').create({ email: `managed-${suffix}@example.com` })
    const patched = await client.service('users').patch(managed.id, { email: `updated-${suffix}@example.com` })
    assert.strictEqual(patched.email, `updated-${suffix}@example.com`)
    await client.service('users').remove(managed.id)
    await client.logout()

    await app.service('users').remove(createdUser.id)
    await app.service('users').remove(admin.id)
  })

  it('allows public listing reads and limits writes to owners or admins', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const password = 'supersecret'
    const ownerData = { email: `owner-${suffix}@example.com`, password }
    const otherData = { email: `other-${suffix}@example.com`, password }
    const adminData = { email: `listing-admin-${suffix}@example.com`, password }
    const owner = await app.service('users').create(ownerData)
    const other = await app.service('users').create(otherData)
    const admin = await app.service('users').create(adminData)
    await app.get('sqliteClient')('users').where({ id: admin.id }).update({ system_role: 'admin' })

    const ownerClient = createClient(rest(appUrl).axios(axios))
    const otherClient = createClient(rest(appUrl).axios(axios))
    const adminClient = createClient(rest(appUrl).axios(axios))
    await ownerClient.authenticate({ strategy: 'local', ...ownerData })
    await otherClient.authenticate({ strategy: 'local', ...otherData })
    await adminClient.authenticate({ strategy: 'local', ...adminData })

    await assert.rejects(client.service('listings').create({ text: 'anonymous' } as any), { code: 401 })
    const listingData = { text: 'public listing', description: 'Healthy aquarium plants', price: 12.5, location: 'Centretown, Ottawa' }
    const listing = await ownerClient.service('listings').create({ ...listingData, owner_id: other.id })
    assert.strictEqual(listing.owner_id, owner.id, 'The signed-in user owns the listing')
    assert.strictEqual(listing.location, 'Centretown, Ottawa')
    assert.strictEqual((await client.service('listings').get(listing.id)).text, 'public listing')
    assert.strictEqual((await client.service('listings').find({ query: { id: listing.id } })).total, 1)

    await assert.rejects(client.service('listings').patch(listing.id, { text: 'anonymous edit' }), { code: 401 })
    await assert.rejects(client.service('listings').remove(listing.id), { code: 401 })
    await assert.rejects(otherClient.service('listings').patch(listing.id, { text: 'changed' }), { code: 404 })
    await assert.rejects(otherClient.service('listings').remove(listing.id), { code: 404 })
    await assert.rejects(otherClient.service('listings').patch(listing.id, { text: 'changed' }, { query: { owner_id: owner.id } }), { code: 404 })
    await assert.rejects(ownerClient.service('listings').patch(listing.id, { owner_id: other.id } as any), { code: 400 })
    await assert.rejects(ownerClient.service('listings').patch(listing.id, { location: '   ' }), { code: 400 })
    await assert.rejects(ownerClient.service('listings').create({ ...listingData, location: '' }), { code: 400 })
    await assert.rejects(ownerClient.service('listings').create({ ...listingData, location: 'x'.repeat(21) }), { code: 400 })
    await assert.rejects(ownerClient.service('listings').create({ text: listingData.text, description: listingData.description, price: listingData.price } as any), { code: 400 })
    assert.strictEqual((await ownerClient.service('listings').patch(listing.id, { text: 'owner edit' })).text, 'owner edit')
    assert.strictEqual((await ownerClient.service('listings').patch(listing.id, { location: 'M5V 2T6' })).location, 'M5V 2T6')
    assert.strictEqual((await ownerClient.service('listings').patch(listing.id, { location: 'Toronto' })).location, 'Toronto')
    assert.strictEqual((await adminClient.service('listings').patch(listing.id, { text: 'admin edit' })).text, 'admin edit')
    await adminClient.service('listings').remove(listing.id)
    const ownedListing = await ownerClient.service('listings').create({ ...listingData, text: 'owner removable' })
    assert.strictEqual(ownedListing.owner_id, owner.id)
    await ownerClient.service('listings').remove(ownedListing.id)

    await app.service('users').remove(owner.id)
    await app.service('users').remove(other.id)
    await app.service('users').remove(admin.id)
  })
})
