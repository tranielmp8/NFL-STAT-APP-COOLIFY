# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --add prettier tailwindcss="plugins:typography,forms" drizzle="database:postgresql+postgresql:postgres.js+docker:no" better-auth="demo:password" --install npm nfl-stat-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Production Notes

Set these environment variables in your host or Coolify resource:

```sh
DATABASE_URL=postgresql://...
ORIGIN=https://your-domain.example
BETTER_AUTH_SECRET=replace-with-a-random-secret
```

Run migrations and seed baseline data:

```sh
npm run db:migrate
npm run db:seed
npm run db:seed:settings
```

Bootstrap the first admin by setting `ADMIN_EMAIL` to the email address that signed in, then run:

```sh
npm run admin:promote
```

After the first admin exists, admins can promote or demote users from `/admin/settings`.

Queue sync jobs from `/admin/data-sync`. A one-off job can be processed with:

```sh
npm run sync:worker:once
```

For automatic processing, run a separate worker resource with:

```sh
npm run sync:worker
```

Worker tuning:

```sh
SYNC_WORKER_POLL_MS=15000
SYNC_WORKER_STALE_MINUTES=180
```

Queued jobs can be canceled from `/admin/data-sync`. Running jobs are not canceled in-place; if a
worker crashes and stops updating a running job, the worker marks it failed after
`SYNC_WORKER_STALE_MINUTES`.
