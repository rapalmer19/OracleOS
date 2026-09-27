# OracleOS Backend Setup

## Current project

- GitHub: `rapalmer19/OracleOS`
- Supabase: dedicated OracleOS project
- Local Expo repo: `/workspace/Github/oracleos-mobile`

## Next manual Supabase step

Open the OracleOS Supabase project SQL Editor and run:

```text
supabase/migrations/001_initial_oracleos_schema.sql
```

This creates the first multi-practitioner schema:

- `profiles`
- `practitioners`
- `practitioner_members`
- `practitioner_services`
- `reading_slots`
- `readings`
- `reading_queue_events`

It also enables RLS and creates starter policies.

## Keys and secrets

Do not paste service-role keys, database passwords, Stripe secrets, or webhook secrets into Discord.

For Expo client code, only use:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
DATABASE_URL
```

Those belong only in protected server environments.

## First functional build order

1. Apply schema migration in Supabase.
2. Add Supabase client library to the app.
3. Create login/account screens using Supabase Auth.
4. Seed Ryan as first practitioner.
5. Replace mock services/queue with Supabase rows.
6. Add Stripe test checkout for Mini/Deep readings.
7. Add admin-only slot/status updates.
