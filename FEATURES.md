# Feature Highlights

## Navigation & Layout
- Four primary tabs — **Buckets**, **To-Do**, **Goals**, **Notes** — are now mirrored across desktop and mobile nav.
- Buckets is the default landing page on load (`#/buckets`).
- Default buckets are seeded for every workspace (offline & new accounts) so each tab always has data to show.
- Bucket headers include direct navigation: clicking a bucket name opens the To-Do tab scoped to that bucket. Scope chips can be cleared instantly.

## Tasks & Buckets
- Global **+ Add Task** button on the To-Do tab opens the task modal from anywhere. When scoped to a bucket, the modal preselects that bucket and hides the selector.
- Buckets render quick stats (completed/total) and expose an inline rename flow via the ✎ button. Rename works offline and syncs when online.
- Task counters and bucket badges stay in sync after CRUD, including when syncing with the backend.

## Sync & Defaults
- Remote users without buckets are auto-seeded with the default set on first login.
- Offline stores migrate legacy bucket names ("To Do", "Long Term Goals", etc.) to the new To-Do/Goals/Notes naming automatically.

## Responsiveness & UX
- Task filter pills, action chips, and the new bucket navigation controls inherit existing responsive breakpoints — the layout collapses gracefully on mobile while preserving the new controls.
- All new controls respect the existing theme tokens in `AppTheme` to maintain visual consistency across light/dark modes.
