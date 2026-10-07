# Architecture

Simplaexity is an evidence-gated execution controller. Replaceable AI workers may inspect and produce bounded candidate work, but controller state determines what is eligible and a separate verifier authority determines whether declared acceptance checks have evidence.

Foundation topology:

`user outcome -> durable controller -> validated dependency graph -> execution lease -> worker candidate -> trusted verifier boundary -> evidence receipt -> controlled delivery boundary`

The first persistence layer is atomic JSON per run. It is intentionally single-controller-writer only. Migration trigger: before multiple controller replicas or concurrent writers are enabled, replace the file store with transactional shared storage and preserve lease fencing semantics.

The public worker MCP surface begins with stdio and the official `@modelcontextprotocol/server` v2 SDK. Protocol handlers remain thin; state-transition policy belongs in `RunController`.
