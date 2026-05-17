# AGENTS.md - Delegates

This folder contains business logic, retrievers, action handlers, subscriptions, and data-processing helpers.

- Keep delegate code independent from Lit rendering whenever practical.
- Prefer pure functions for transforms, filtering, sorting, and state calculations.
- Keep Home Assistant API access behind existing retriever/subscription patterns.
- Add or update focused unit tests when changing behavior here.
- Do not move UI concerns into delegates; return data that cards can render.
