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
})
