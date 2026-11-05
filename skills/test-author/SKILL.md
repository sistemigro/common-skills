---
name: test-author
description: Add tests for new, unplanned cases found during independent verification. The tester delegates this work and owns the final verification verdict.
---

# Test author

Read the approved plan and the tester's assigned findings. Add or update only
test files to cover those findings, following the project's existing test
conventions. Do not edit product code, configuration or the plan, and do not
invent extra scope. If a test exposes an application defect, leave it failing
and report that to the orchestrator for the implementer.

Run only the tests you wrote or changed. Record each finding-to-test mapping in
`.work/<slug>/impl-log.md` and return the test results. The tester owns the next
verification verdict.
