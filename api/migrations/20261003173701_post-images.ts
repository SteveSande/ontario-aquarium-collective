// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('post-images', table => {
    table.increments('id')
    table.integer('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE')
    table.string('filename', 100).notNullable().unique()
    table.integer('position').notNullable()
    table.string('mime_type', 30).notNullable()
    table.integer('size_bytes').notNullable()
    table.unique(['post_id', 'position'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('post-images')
}
