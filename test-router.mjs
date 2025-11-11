import { appRouter } from './server/routers.ts';

console.log('AppRouter keys:', Object.keys(appRouter._def.procedures || {}));
console.log('Has demand router:', 'demand' in (appRouter._def.procedures || {}));
