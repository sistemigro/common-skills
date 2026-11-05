<!-- sistemigro/common-skills agent routing:start -->
## Sistemigro agent routing

Use the installed Sistemigro agents proactively based on the user's request. The
user does not need to name an agent or invoke a skill to activate this workflow.

- For substantial, multi-step feature or product work, delegate coordination to
  `sistemigro-feature`. It settles consequential decisions, gets approval on a
  plan, delegates implementation, and verifies only when requested.
- For a plan-only request, use `sistemigro-planner`. For implementation, use
  `sistemigro-implementer` once the user has approved the plan.
- For a user-requested test or review round, use `sistemigro-tester`; use
  `sistemigro-reviewer` when an independent code-quality review is requested or
  warranted.
- For focused security/privacy or marketing/search work, use
  `security-auditor` or `sistemigro-marketing-specialist`.
- On design-heavy planning, the planner delegates design-system discovery to
  `design-specialist`; on design-sensitive implementation, the
  implementer asks it for scoped recommendations; on design verification, the
  tester delegates a read-only audit to it. The specialist does not edit
  implementation files when delegated.
- During verification, the tester delegates new, unplanned test cases to
  `test-author`. The tester also delegates suite execution and only
  the other auditors relevant to the changed scope.

Do not delegate contained edits, simple questions, or routine work when an agent
would add overhead. Respect the user's approvals and scope. If a host cannot
spawn a named profile, read its definition from the setup skill's `agents/`
directory (commonly `.agents/skills/setup/agents/`, `.claude/skills/setup/agents/`,
or `skills/setup/agents/` in this repository) and follow that role in the
current session or pass those instructions to an available general-purpose
subagent. Continue without asking the user to invoke a skill or name the agent
as a workaround.

Keep the user's approvals in the main conversation. If the coordinator returns
a plan as a subagent, show it to the user and wait for approval before asking
the coordinator or implementer to continue.
<!-- sistemigro/common-skills agent routing:end -->
