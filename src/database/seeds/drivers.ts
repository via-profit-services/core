/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import faker from 'faker/locale/ru';
import * as Knex from 'knex';
import moment from 'moment-timezone';

const DRIVERS_QUANTITY = 109;

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

function arrayShuffle(array: any[]) {
  const resArray = [...array];
  let currentIndex = resArray.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = resArray[currentIndex];
    resArray[currentIndex] = resArray[randomIndex];
    resArray[randomIndex] = temporaryValue;
  }

  return array;
}

const generatePasport = () => ({
  number: randomInt(6541232587, 6985478545).toString(),
  code: `${randomInt(910, 920)}-003`,
  createdAt: moment()
    .subtract(randomInt(6, 15), 'years')
    .subtract(randomInt(1, 365), 'days')
    .format('YYYY.MM.DD'),
  from: `Отделом УФМС России по ${faker.address.state()} в г. ${faker.address.city}`,
  birthdayCity: `${faker.address.state()}, ${faker.address.streetSuffix} ${faker.address.city} ${
    faker.address.streetName
  }`,
  registration: `${faker.address.state()}, ${faker.address.streetSuffix} ${
    faker.address.city
  } ${faker.address.streetName()}`,
});

const generateComment = () => {
  const arr = [
    'Часто бухает',
    'Скандалист',
    'Только Ватсапп',
    'Нервный',
    'ЗП раз в неделю',
    'Плохо водит',
    'Много штрафов',
    'грубит гаишникам',
  ];

  if (randomInt(0, 100) > 90) {
    return arr[randomInt(0, arr.length - 1)];
  }

  return '';
};

const generatePayments = () => [
  {
    rs: faker.finance.iban(),
    ks: faker.finance.iban(),
    bik: faker.finance.iban(),
    bank: [
      'Публичное акционерное общество «Сбербанк России»',
      'АО «Тинькофф Банк»',
      'Точка ПАО Банка «ФК Открытие»',
      'АКЦИОНЕРНОЕ ОБЩЕСТВО «АЛЬФА-БАНК»',
    ][randomInt(0, 3)],
    card: `42761600${faker.finance.account()}`,
  },
];

const generateDriverLicense = () => ({
  number: randomInt(7441232587, 8985478545).toString(),
  createdAt: moment()
    .subtract(randomInt(6, 15), 'years')
    .subtract(randomInt(1, 365), 'days')
    .format('YYYY.MM.DD'),
  categories: arrayShuffle(['A', 'B', 'C', 'D', 'B1', 'C1', 'E1', 'M']).slice(randomInt(1, 4)),
});

export async function seed(knex: Knex): Promise<any> {
  // Deletes ALL existing entries
  return knex('drivers')
    .del()
    .then(() => knex('drivers').insert(
      [...Array(DRIVERS_QUANTITY).keys()].map(() => ({
        id: faker.random.uuid(),
        createdAt: moment().format(),
        updatedAt: moment().format(),
        name: faker.name.findName(),
        birthday: moment()
          .subtract(randomInt(30, 55), 'years')
          .subtract(randomInt(1, 365), 'days'),
        status: ['active', 'inactive', 'dismissed', 'sick', 'blocked', 'holiday'][randomInt(0, 5)],
        legalStatus: ['person', 'legal', 'entrepreneur'][randomInt(0, 2)],
        phones: JSON.stringify(
          [
            { number: faker.phone.phoneNumber(), country: 'RU' },
            { number: faker.phone.phoneNumber(), country: 'RU' },
            { number: faker.phone.phoneNumber(), country: 'RU' },
          ].slice(0, randomInt(1, 3)),
        ),
        inn: `${faker.finance.account().toString()}${faker.finance.account().toString()}`,
        snils: `${faker.finance.account().toString()}${faker.finance.account().toString()}`,
        pasport: JSON.stringify(generatePasport()),
        driverLicense: JSON.stringify(generateDriverLicense()),
        tachographMap: Boolean(randomInt(0, 1)),
        specialPermission: Boolean(randomInt(0, 1)),
        payments: JSON.stringify(generatePayments()),
        comment: generateComment(),
      })),
    ));
}
