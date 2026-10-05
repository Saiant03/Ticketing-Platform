# Skill-uri incluse

Copiate din repo-urile originale (licentele sunt pastrate in fiecare folder). Pentru update, re-copiaza din sursa.

| Skill | Sursa | Commit | Licenta | Rol in proiect |
|---|---|---|---|---|
| frontend-design | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 8a1541c | Apache-2.0 | Directie vizuala, tipografie, paleta, evitarea look-ului generic |
| webapp-testing | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | 8a1541c | Apache-2.0 | Teste Playwright + screenshot-uri pe paginile HTML |
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 6e802bd | Apache-2.0 | Comenzi audit / critique / polish / layout / typeset / harden |
| ui-ux-pro-max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 477bcb2 | MIT | Generare design system (culori, fonturi, reguli UX) din date locale |
| redesign-existing-projects | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill/tree/main/skills/redesign-skill) | ce26fc2 | MIT | Redesign incremental al unei aplicatii existente fara a strica functionalitatea |
| ponytail, ponytail-review, ponytail-audit, ponytail-debt | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/tree/main/skills) | 1876cce | MIT | Cod minim (YAGNI, stdlib/nativ inainte de cod propriu); review si audit pe supra-inginerie |
| google-apps-script | [jezweb/claude-skills](https://github.com/jezweb/claude-skills/tree/main/plugins/integrations/skills/google-apps-script) | ee91a87 | MIT | Pattern-uri Apps Script: triggers, HtmlService, Sheets, email, quotas |

Note:
- `impeccable` descarca la prima rulare un binar propriu (verificat cu sha256) din release-urile GitHub ale proiectului.
- `ui-ux-pro-max` necesita Python 3 (`scripts/search.py`). Folderul de teste al upstream-ului a fost eliminat.
- `ponytail`: am copiat doar skill-urile. Hook-urile plugin-ului (activare automata, injectare in sub-agenti, statusline) nu sunt incluse; in proiect activarea vine din `CLAUDE.md` si din agentii din `.claude/agents/`. `ponytail-help` si `ponytail-gain` nu sunt copiate (card de ajutor pentru plugin si benchmark).
