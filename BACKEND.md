# Optional AI integration contract

The demo does not call a server. A future application can inject `BackendConversationService` through the `ConversationService` interface.

`POST /api/conversation` accepts `{ topic, messages: [{role,text}], input }` and returns `{ text }`. The frontend adapter wraps that as a `BotReply`. Scripted bilingual replies also attach a locally curated `hokkien` phrase; the backend adapter currently accepts only the response text and does not trust arbitrary translated fields. Use same-origin deployment, a server-managed user session, strict payload limits, and topic validation. API keys belong only in the server secret store. Never expose them through `VITE_*` variables.

Before returning generated content, the server must run configurable review rules and withhold uncertain or sensitive output. A real review system needs authenticated authorised reviewers, consent-based minimal content transfer, persistent review status, immutable decision history, and a mechanism to deliver only approved or corrected output. Until then return a plain verification fallback. The current `/internal/review` demonstrates this state machine locally using synthetic requests and must not be exposed as a production review console.

Private photos, recordings and stories are not part of this contract. Adding any remote transfer requires separate explicit user consent, access controls, retention and deletion policies, and additional safeguards for children. The prototype never sends them to this endpoint.
