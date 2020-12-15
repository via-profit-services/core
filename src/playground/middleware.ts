/* eslint-disable no-console */
import { Middleware } from '@via-profit-services/core';


const middleware: Middleware = ({ context }) => ({
  context: {
    ...context,
    foo: () => console.log('The Foo'),
    bar: () => console.log('The Bar'),
  },
})

export default middleware;
