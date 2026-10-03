import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Posts that predate ownership remain manageable by admins only.
  await knex('posts').whereNull('owner_id').update({ owner_id: 0 })
  await knex.schema.alterTable('posts', table => {
    table.integer('owner_id').notNullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', table => {
    table.integer('owner_id').nullable().alter()
  })
  await knex('posts').where({ owner_id: 0 }).update({ owner_id: null })
}
