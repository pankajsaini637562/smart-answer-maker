# Project architecture
- Extend CBT in its own pages and domain helpers, leaving personal OMR workflows separate so exam administration cannot alter personal tests.
- Store CBT approval and authorization server-side and resolve roll-number sign-in through the cbt-auth function, never through a public email lookup, to protect account identifiers.
- Parse question CSVs with Papa Parse and validate again in the transactional import RPC, so malformed imports cannot leave partial papers.
- Admit cards use immutable versioned snapshots and scoped database reads; regenerated cards revoke earlier references to keep verification authoritative.
- This project shares one Cloud environment; independent deployment and account linking are documented prerequisites, not implied by client-side adapters.