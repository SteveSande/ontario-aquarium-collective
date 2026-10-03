import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.enu('system_role', ['admin', 'user']).notNullable().defaultTo('user')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.dropColumn('system_role')
  })
}
