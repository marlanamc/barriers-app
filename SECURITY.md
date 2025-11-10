# Security Documentation

This document outlines the security measures implemented in the ADHD Barrier Tracker application.

## Authentication & Authorization

### Row Level Security (RLS)
All user data tables have RLS enabled with policies that ensure users can only access their own data:

- ✅ `checkins` - Users can only CRUD their own check-ins
- ✅ `focus_items` - Users can only CRUD their own focus items
- ✅ `focus_barriers` - Users can only CRUD their own barriers
- ✅ `planned_items` - Users can only CRUD their own planned items
- ✅ `user_profiles` - Users can only CRUD their own profile
- ✅ `user_calendar_entries` - Users can only view their own calendar

### SECURITY DEFINER Functions
Database functions using `SECURITY DEFINER` include validation to prevent privilege escalation:

- ✅ `create_checkin_with_focus()` validates that `p_user_id` matches `auth.uid()`
- ✅ Functions reject requests where user_id doesn't match the authenticated user
- ✅ Functions require authentication (auth.uid() must not be NULL)

## Input Validation

### Client-Side Validation
- ✅ Focus item descriptions: Max 500 characters
- ✅ Forecast notes: Max 1000 characters
- ✅ Anchor values: Max 200 characters
- ✅ Custom barriers: Max 200 characters
- ✅ Focus items limit: Maximum 5 per check-in
- ✅ Categories limit: Maximum 10 per focus item
- ✅ UUID format validation for user IDs

### Server-Side Validation
Database functions enforce the same limits and additional checks:

- ✅ All text fields are trimmed and validated for length
- ✅ Enum values are validated (anchor_type must be one of: 'at', 'while', 'before', 'after')
- ✅ UUID format validation
- ✅ Array size limits enforced
- ✅ Empty strings are converted to NULL

## SQL Injection Prevention

- ✅ All database queries use parameterized queries via Supabase client
- ✅ No raw SQL string concatenation
- ✅ JSONB parameters are properly escaped
- ✅ UUID parameters are validated before use

## XSS Prevention

- ✅ React automatically escapes content rendered in JSX
- ✅ No use of `dangerouslySetInnerHTML` found in codebase
- ✅ User-generated content is displayed as text, not HTML
- ✅ Input sanitization via trimming and length limits

## Environment Variables

### Secure Configuration
- ✅ Test credentials only work in development mode
- ✅ Test credentials require explicit environment variable configuration
- ✅ Production mode disables test user auto-creation
- ✅ No hardcoded credentials in source code

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public, safe to expose)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public, safe to expose)
- `NEXT_PUBLIC_TEST_EMAIL` - Test email (development only, optional)
- `NEXT_PUBLIC_TEST_PASSWORD` - Test password (development only, optional)

**Note:** The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser. Never use this prefix for sensitive secrets.

## Data Protection

### User Data Isolation
- ✅ All queries filter by `user_id` matching `auth.uid()`
- ✅ RLS policies enforce data isolation at the database level
- ✅ No cross-user data access possible

### Data Validation
- ✅ Date fields validated to prevent invalid dates
- ✅ Enum fields validated against allowed values
- ✅ Array fields validated for size and content type
- ✅ Text fields validated for length and content

## Security Best Practices

### Development
- ✅ Test credentials only work in development
- ✅ Test credentials must be explicitly configured
- ✅ No default test credentials hardcoded

### Production
- ✅ Test user auto-creation disabled
- ✅ All RLS policies enforced
- ✅ Input validation at both client and server
- ✅ Error messages don't expose sensitive information

## Security Checklist

Before deploying to production, ensure:

- [ ] All RLS policies are enabled and tested
- [ ] Test credentials are not set in production environment
- [ ] Environment variables are properly configured
- [ ] Database functions validate user_id matches auth.uid()
- [ ] Input validation is working on both client and server
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting is configured (if applicable)
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do not create a public GitHub issue
2. Contact the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Security Updates

Security updates are tracked in:
- Database migrations: `database/migrations/20241221_fix_security_issues.sql`
- This document: Updated when security measures change

