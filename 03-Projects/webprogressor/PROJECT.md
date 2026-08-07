> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/webprogressor/.claude/project.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

---

name: Project webprogressoer
description: WordPress developer — preferences, skills, and working style
type: user
----------

## Project Overview

This is a custom WordPress project built without page builders or external field plugins.

The project uses:

* Custom theme (built from scratch)
* Custom lightweight fields system (ACF-like, self-implemented)
* Options page for global settings
* Native WordPress architecture (hooks, filters, templates)

## Core Priority

* Maximum performance (fast execution, low overhead)
* Minimal error rate (predictable and stable logic)
* Efficient data handling

## Custom Fields System

* This project DOES NOT use ACF or any external plugins
* Custom fields are implemented manually (lightweight logic)
* Data access via:

  * get_post_meta()
  * custom helper functions
* DO NOT suggest installing ACF or rewriting field logic

## Performance Rules

* Minimize database queries
* Avoid duplicate function calls
* Cache values in variables when reused
* Prefer simple loops over complex abstractions
* Avoid heavy or nested logic when possible
* Use native WordPress functions efficiently
* Do not introduce unnecessary dependencies

## Accuracy Rules

* Avoid “approximate” logic
* Ensure predictable output
* Validate data before processing
* Handle edge cases
* Do not assume missing values

## Structure & Logic

* Data is dynamic and controlled via custom fields
* Global content is managed through Options page
* Templates follow WordPress hierarchy
* Codebase is minimal and clean

## Key Requirements

* Always respect existing structure
* Do not break current logic
* Do not rewrite working code
* Solve only the конкретну задачу

## Development Approach

* Prefer PHP and WordPress-native solutions
* Keep logic simple, direct, and efficient
* Avoid overengineering
* Optimize where possible without breaking behavior

## Working With Existing Code

* Analyze before making changes
* Make minimal точкові правки
* Do not refactor unless explicitly asked
* Maintain compatibility with current system

## Expected Output From AI

* Fast and optimized solutions
* High accuracy and stability
* No generic or theoretical answers
* Only relevant and working code

## Code Rules

* ALWAYS comment any code changes
* Use `//` comments only
* Clearly explain what was changed and why (short and precise)
* Do not output uncommented modifications

## Strict Restrictions

* DO NOT suggest ACF or any field plugins
* DO NOT introduce frameworks
* DO NOT rebuild existing logic
* DO NOT change HTML structure unless asked

## Important

* If something is unclear — ask before coding
* Do not assume missing logic
* Follow the task strictly
* Prioritize performance and accuracy over everything
