/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import faker from 'faker/locale/ru';
import * as Knex from 'knex';
import moment from 'moment-timezone';

const RECORDS_QUANTITY = 10000;

const randomInt = (min?: number, max?: number) => {
  const data = { min, max };

  if (typeof min === 'undefined') {
    data.min = randomInt(99999);
  }

  if (typeof max === 'undefined') {
    data.max = data.min * 2;
  }

  return Math.floor(Math.random() * (data.max - data.min + 1) + data.min);
};

export async function seed(knex: Knex): Promise<any> {
  // Deletes ALL existing entries
  return (
    knex('mock')
      // .del()
      .then(() => knex('mock').insert(
        [...Array(RECORDS_QUANTITY).keys()].map(() => ({
          id: faker.random.uuid(),
          createdAt: moment().format(),
          email: faker.helpers.userCard().email,
          name: faker.name.findName(),
          birthday: moment()
            .subtract(randomInt(30, 55), 'years')
            .subtract(randomInt(1, 365), 'days'),
          text: faker.lorem.paragraphs(),
        })),
      ))
  );
}
