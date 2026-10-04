# Research skill-uri (octombrie 2026)

Criterii: relevanta pentru redesign UI al unei aplicatii interne existente + compatibilitate cu Apps Script/HtmlService (HTML/CSS/JS fara build step).

## Incluse

| Skill | De ce |
|---|---|
| frontend-design (Anthropic) | Cel mai instalat skill de design; impinge spre decizii vizuale specifice in loc de UI generic. |
| impeccable | Un skill cu ~18 comenzi (audit, critique, polish, layout, typeset, harden, adapt). Acopera audit si finisare. |
| ui-ux-pro-max | Baza de date locala (stiluri, palete, perechi de fonturi, reguli UX) si generator de design system. Util pentru alegerea sistemului vizual. |
| redesign-existing-projects (Taste) | Facut special pentru upgrade de proiecte existente: scan -> diagnoza -> fix fara a strica functionalitatea. Merge cu vanilla CSS. |
| google-apps-script (jezweb) | Pattern-uri Apps Script: HtmlService, dialoguri, triggers, Sheets, email, limite. |
| webapp-testing (Anthropic) | Playwright pentru screenshot-uri si verificari UI. |

## Evaluate si lasate deoparte

- **gas-best-practices** (kpcrmv4): reguli bune extrase din bug-uri de productie, dar continutul e in thailandeza si cere mesaje de eroare in thailandeza. Poate fi adaugat ulterior daca apar probleme de concurenta/quotas.
- **clasp MCP / plugin** (`claude mcp add clasp -- npx -y @google/clasp mcp`): util local pentru push/pull direct din Claude Code; nu e skill, se configureaza pe masina ta.
- **Taste: celelalte variante** (soft, brutalist, minimalist etc.): stiluri fixe; se aleg dupa ce avem directia vizuala.
- Skill-uri React/Tailwind/shadcn: nepotrivite fara build step in HtmlService.

## Surse

- https://fast.io/resources/awesome-claude-skills-directory-2026/
- https://pasqualepillitteri.it/en/news/576/claude-code-skills-design-uiux-guide
- https://www.firecrawl.dev/blog/best-claude-code-skills
- https://snyk.io/articles/top-claude-skills-ui-ux-engineers/
- https://composio.dev/content/top-design-skills
- https://designrevision.com/blog/best-claude-code-skills
- https://claudeskills.info/best/frontend-design-skills/
- https://github.com/kpcrmv4/gas-best-practices
- https://claudemarketplaces.com/skills/jezweb/claude-skills/google-apps-script
