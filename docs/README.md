# LawTech documentation

All project documentation lives under this `docs/` directory. Add new design notes, PRDs, and exports here (prefer subfolders by topic).

## Contents

| Path | Description |
|------|-------------|
| [project-README.md](project-README.md) | Copy of the repository root overview (monorepo pointer). |
| [design/](design/) | Design-phase documents (e.g. schedule system Word export). |
| [product/](product/) | Product specs and engagement models (Word, diagram sources, build scripts). |
| [reference/](reference/) | Snapshots of per-app README templates from `advocate-*-app/`. |

## Product artifacts

- **Client engagement models (Word):** [product/Client_Engagement_Models.docx](product/Client_Engagement_Models.docx)
- **Diagram sources:** [product/_diagrams/](product/_diagrams/)
- **Regenerate DOC-x:** from repo root, `python3 docs/product/build_client_engagement_docx.py`

## Convention for future docs

- Place new material under `docs/<topic>/` (e.g. `docs/legal/`, `docs/api/`).
- Keep large binaries (`.docx`, `.pdf`) next to optional source (`.mmd`, scripts) when applicable.
- Update this index when you add major sections.
