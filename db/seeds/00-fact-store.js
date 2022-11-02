const ms = require('ms');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries and reset id sequences
  await knex('fact_store').truncate();
  await knex('fact_store').insert([
    {id: 1, path: 'user', key: '1', value: {credits: 100 }},
    {id: 2, path: 'user', key: '2', value: {credits: -10, bannedUntil: ms('10 days')}},
    {id: 3, path: 'user', key: '3', value: {credits: 0, bannedUntil: ms('1 days')}},
    {id: 4, path: 'user_credits', key: '1', value: 100 },
    {id: 5, path: 'user_credits', key: '2', value: -10 },
  ]);
  // .returning('*')
  // .then((rows) => {
  //   console.log('inserted ', rows);
  // });
};
