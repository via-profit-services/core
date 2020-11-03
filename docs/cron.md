# Cron

> Via Profit services / **Core**

Для реализации Cron-подобных заданий используется `CronJobManager` - статический класс, являющийся оберткой над пакетом [Node-Cron](https://github.com/kelektiv/node-cron).

### Методы

**CronJobManager.`configure`** - Служебный метод первичной конфигурации класса. Вызывается единожды при инициализации приложения.

**CronJobManager.`addJob`** - Добавляет новое `Cron` задание и возвращает инстанс `CronJob`

_Параметры:_

- _jobName_ `string` - Уникальное имя задания
- _jobConfig_ `CronJobParameters` - Объект параметров [Node-cron](https://github.com/kelektiv/node-cron#api)

_Пример:_

```ts
import { CronJobManager } from '@via-profit-services/core';

CronJobManager.addJob('MyJobName', {
  cronTime: '*/30 * * * * *', // Выполнение каждые 30 секунд
  onTick: () => console.log('Fiered'), // Функция, которая выполнится
  start: true, // Активировать задание
});
```

В отличии от Crontab в данной реализации есть пара различий:

1. Диапозоны начинаются с секунд, а не с минут
2. Дни недели начинаются с 0 и заканчиваются 6, а не 7

- Секунды: 0-59
- Минуты: 0-59
- Часы: 0-23
- Число месяца: 1-31
- Месяц: 0-11 (Январь-Декабрь)
- День недели: 0-6 (Воскресенье-Суббота)

**CronJobManager.`getJob`** - Возвращает инстанс `CronJob` или `undefined`, если искомое задание не зарегистрировано
_Параметры:_

- _jobName_ `string` - Имя задания

**CronJobManager.`getPool`** - Возвращает весь пул заданий, которые имеются в памяти. Пул представлен стандартным типом `Map`
