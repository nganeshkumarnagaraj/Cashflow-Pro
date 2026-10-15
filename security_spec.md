# Security Specification: Cashflow Pro (Firestore Security Rules)

## 1. Data Invariants
1. **User Scoping & Isolation**: All user-specific transactions and budget settings are strictly partitioned under `/users/{userId}/...`. No user can read, list, create, update, or delete any record belonging to another user.
2. **Identity Integrity**: Every transaction document created under `/users/{userId}/transactions/{transactionId}` must have `incoming().userId == request.auth.uid` and path variable `userId == request.auth.uid`.
3. **Type Safety & Bounds**:
   - `amount` must be a positive number (`number > 0`).
   - `title` must be a non-empty string under 150 characters.
   - `type` must strictly be either `'income'` or `'expense'`.
   - `categoryId` must be a valid alphanumeric/hyphenated string under 50 characters.
   - `paymentMethod` must be one of allowed payment methods under 50 characters.
   - `date` must be a formatted ISO date string (`YYYY-MM-DD`).
4. **Path ID Hardening**: Document IDs and path variables must adhere to `^[a-zA-Z0-9_\-]+$` and be $\le 128$ characters.
5. **PII Protection**: User profile documents at `/users/{userId}` can only be read or written by the verified authenticated owner (`request.auth.uid == userId`).

---

## 2. The "Dirty Dozen" Threat Payloads
1. **Malicious Cross-User Read**: User B attempting `get(/users/UserA/transactions/tx_123)` -> Expect `PERMISSION_DENIED`.
2. **Malicious Cross-User List Query**: User B attempting `list(/users/UserA/transactions)` -> Expect `PERMISSION_DENIED`.
3. **Spoofed User ID Write**: User A attempting to write a transaction into `/users/UserA/transactions/tx_1` with `userId: "UserB"` -> Expect `PERMISSION_DENIED`.
4. **Negative or Zero Amount Poisoning**: User A creating transaction with `amount: -500` or `amount: 0` -> Expect `PERMISSION_DENIED`.
5. **Oversized String Buffer Overflow (Denial of Wallet)**: User A injecting a 1MB payload in `title` -> Expect `PERMISSION_DENIED` (capped at 150 chars).
6. **Unknown Type Injection**: User A injecting `type: "crypto_drain"` instead of `"income"` or `"expense"` -> Expect `PERMISSION_DENIED`.
7. **Unauthenticated Read/Write**: Unauthenticated visitor attempting to query any user document -> Expect `PERMISSION_DENIED`.
8. **Path ID Traversal / Junk Characters**: Attempting to write with ID containing slashes or illegal characters like `../` -> Expect `PERMISSION_DENIED`.
9. **Ghost Fields / Shadow Update**: User attempting to inject a shadow admin key `isAdmin: true` into their transaction -> Expect `PERMISSION_DENIED` via `hasOnly()`.
10. **Immutable Field Modification**: Attempting to change `userId` or `createdAt` on an existing transaction -> Expect `PERMISSION_DENIED`.
11. **Client Delegation Query Attempt**: Querying without scoping to `request.auth.uid` -> Expect `PERMISSION_DENIED`.
12. **Malformed Date String Attack**: Writing binary / invalid date structure in `date` field -> Expect `PERMISSION_DENIED`.

---

## 3. Test Runner Verification Plan
- Unit and integration tests verify that all 12 payloads are blocked by security rules and that standard authenticated CRUD operations for the matching `request.auth.uid` succeed.
