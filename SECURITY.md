# Security Policy

This document describes how security issues are handled for this **Home Assistant custom card** (Lovelace). The same **semantic versioning** scheme applies across related cards: **MAJOR.MINOR.PATCH** (see [SemVer](https://semver.org/)).

## Supported Versions

Security fixes are targeted at supported release lines as follows:

| Release line                                                                        | Supported for security fixes         |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| **Latest** published release (highest `MAJOR.MINOR.PATCH` tag)                      | Yes                                  |
| **Previous minor** within the **same major** (e.g. `2.3.x` when `2.4.x` is current) | Critical issues only, when practical |
| **Older** lines (previous major, or minors older than the previous one)             | No — upgrade to a supported release  |

**Prereleases** (e.g. `-beta`, `-rc`, or `0.x` early tags): only the **latest** prerelease in a given line is considered; move to the newest tag or a stable release when possible.

For day-to-day use, run the **latest release** from this repository’s Releases page or from HACS.

## Reporting a Vulnerability

**Do not** file a **public issue** for undisclosed security problems.

1. **Preferred:** If the repository has private reporting enabled, use the **Security** tab → **Report a vulnerability** (see [GitHub’s documentation](https://docs.github.com/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).
2. **Otherwise:** Contact the maintainers via the options shown on the repository or organization profile.

Please include:

- What is affected and the potential impact
- Steps to reproduce or a minimal proof of concept, if you can share one safely
- Version or release tag you tested

You should receive an initial response within a **few business days**. Accepted reports are handled with a coordinated fix and release where possible; if a report is declined, you will get a short explanation.

### Scope

This project is **frontend-only**: it runs in the browser as part of the Home Assistant UI. Reports should concern this card’s code, configuration handling, or behavior in that context. Issues in **Home Assistant Core**, other integrations, or third-party services are outside this repository’s scope (report those to the appropriate project).
