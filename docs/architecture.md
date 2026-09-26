# NAVYA Architecture Notes

## Tenant model

All organization-owned records must carry an organization/tenant identifier and be protected by server-side authorization rules.

Conceptual relationship:

Organization
→ Users
→ Teachers
→ Students
→ Classes
→ Subjects
→ Questions
→ Libraries
→ Tests
→ Results
→ Attendance
→ Fees
→ Assignments
→ Courses
→ Documents
→ Notifications
→ Audit Logs

## Library visibility

1. Teacher Private
2. Department Shared
3. Institute Shared
4. Organization Group Shared
5. NAVYA Central Library
6. Marketplace

Sharing must always be explicit. Private material must never become visible merely because two users are logged in to NAVYA.

## Video strategy

The first implementation supports video records containing:

- title
- description
- thumbnail (optional)
- provider
- external video ID / URL
- class / subject / course association
- visibility
- organization ID
- created by
- timestamps

The UI will provide an "Add Video" action and a clear popup explaining that the institute can paste a supported external video link. A future premium upload/storage provider can be plugged in behind the same video record model.

## Security rule

Never trust organization IDs, role IDs, user IDs, or permissions supplied by the browser. The backend must derive the authenticated user and authorized organization from the session/token and enforce access server-side.
