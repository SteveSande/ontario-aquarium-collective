import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', table => {
    table.text('description').notNullable()
    table.decimal('price', 10, 2).notNullable()
    table.string('location', 7).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('description')
    table.dropColumn('price')
    table.dropColumn('location')
  })
}
