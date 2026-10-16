import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('posts', 'listings')
  await knex.schema.renameTable('post-images', 'listing-images')
  await knex.schema.alterTable('listing-images', table => {
    table.renameColumn('post_id', 'listing_id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('listing-images', table => {
    table.renameColumn('listing_id', 'post_id')
  })
  await knex.schema.renameTable('listing-images', 'post-images')
  await knex.schema.renameTable('listings', 'posts')
}
