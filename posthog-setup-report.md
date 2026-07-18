# PostHog post-wizard report

The wizard integrated PostHog into the Expo application with environment-backed configuration, lifecycle and manual Expo Router screen tracking, touch autocapture, authenticated user identification, exception capture around authentication and sign-out failures, and product events for the most meaningful existing actions. PostHog is initialized once and shared through the root application tree.

| Event name | Description | File |
| --- | --- | --- |
| `sign_in_completed` | Records a successful authenticated sign-in after the session is finalized. | `app/(auth)/sign-in.tsx` |
| `sign_up_completed` | Records a completed account registration after email verification and session finalization. | `app/(auth)/sign-up.tsx` |
| `subscription_details_toggled` | Records when a user expands or collapses a subscription card on the home screen. | `app/(tabs)/index.tsx` |
| `sign_out_completed` | Records a successful user sign-out from the settings screen. | `app/(tabs)/settings.tsx` |

## Next steps

The following dashboard and insights were created to monitor the new events:

- [Analytics basics (wizard) dashboard](https://us.posthog.com/project/506099/dashboard/1869823)
- [Authentication completions (wizard)](https://us.posthog.com/project/506099/insights/vyL7uSOL)
- [Subscription engagement (wizard)](https://us.posthog.com/project/506099/insights/fofo5lsD)
- [Completed sign-outs (wizard)](https://us.posthog.com/project/506099/insights/EYuX5Do8)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names added in this integration to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

The Expo integration skill remains available in `.claude/skills/integration-expo` for future agent-assisted PostHog work.
