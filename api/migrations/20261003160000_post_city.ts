import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', table => {
    table.string('city').notNullable()
    table.string('location', 7).nullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', table => {
    table.string('location', 7).notNullable().alter()
    table.dropColumn('city')
  })
}
