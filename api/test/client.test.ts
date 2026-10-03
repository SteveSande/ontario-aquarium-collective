// For more information about this file see https://dove.feathersjs.com/guides/cli/client.test.html
import assert from 'assert'
import axios from 'axios'

import rest from '@feathersjs/rest-client'
import authenticationClient from '@feathersjs/authentication-client'
import { app } from '../src/app'
import { createClient } from '../src/client'
import type { UserData } from '../src/client'

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

  it('allows public post reads and limits writes to owners or admins', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const password = 'supersecret'
    const ownerData = { email: `owner-${suffix}@example.com`, password }
    const otherData = { email: `other-${suffix}@example.com`, password }
    const adminData = { email: `post-admin-${suffix}@example.com`, password }
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

    await assert.rejects(client.service('posts').create({ text: 'anonymous' }), { code: 401 })
    const post = await ownerClient.service('posts').create({ text: 'public post', owner_id: other.id })
    assert.strictEqual(post.owner_id, owner.id, 'The signed-in user owns the post')
    assert.strictEqual((await client.service('posts').get(post.id)).text, 'public post')
    assert.strictEqual((await client.service('posts').find({ query: { id: post.id } })).total, 1)

    await assert.rejects(client.service('posts').patch(post.id, { text: 'anonymous edit' }), { code: 401 })
    await assert.rejects(client.service('posts').remove(post.id), { code: 401 })
    await assert.rejects(otherClient.service('posts').patch(post.id, { text: 'changed' }), { code: 404 })
    await assert.rejects(otherClient.service('posts').remove(post.id), { code: 404 })
    await assert.rejects(otherClient.service('posts').patch(post.id, { text: 'changed' }, { query: { owner_id: owner.id } }), { code: 404 })
    await assert.rejects(ownerClient.service('posts').patch(post.id, { owner_id: other.id } as any), { code: 400 })
    assert.strictEqual((await ownerClient.service('posts').patch(post.id, { text: 'owner edit' })).text, 'owner edit')
    assert.strictEqual((await adminClient.service('posts').patch(post.id, { text: 'admin edit' })).text, 'admin edit')
    await adminClient.service('posts').remove(post.id)
    const ownedPost = await ownerClient.service('posts').create({ text: 'owner removable' })
    assert.strictEqual(ownedPost.owner_id, owner.id)
    await ownerClient.service('posts').remove(ownedPost.id)

    await app.service('users').remove(owner.id)
    await app.service('users').remove(other.id)
    await app.service('users').remove(admin.id)
  })
})
