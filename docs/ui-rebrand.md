# UI Rebrand & PCF Detail (D2) Redesign

This note documents UI-label and visual changes made to the frontend. **Only
user-facing display text and styling changed.** Routes, permission keys,
`authorizationService` module names, component file names, tab state keys, and
the Data Quality Rating (DQR) methodology are **unchanged** — so existing
architecture docs (`PROJECT_STRUCTURE.md`, `SUPPLIER_QUESTIONNAIRE_INTEGRATION.md`,
etc.) remain accurate about identifiers, routes, and methodology.

## Sidebar brand

- Headline: **Enviraan** (unchanged)
- Subtitle: **Management Suite → PCF Management Suite**

## Navigation / feature section labels

Display labels only. The `id`, `path`, and `permissionKey` in
`src/config/menu.ts` (and the matching backend authorization module names) are
unchanged.

| New label          | Old label           | Route                     | Permission key        |
| ------------------ | ------------------- | ------------------------- | --------------------- |
| Footprint Connect  | PCF Request         | `/pcf-request`            | `pcf request`         |
| Product Hub        | Product Portfolio   | `/product-portfolio`      | `product portfolio`   |
| Components Catalog  | Components Master   | `/components-master`      | `component master`    |
| Evidence Vault     | Document Master     | `/document-master`        | `document master`     |
| Workflow Center    | Task Management     | `/task-management`        | `task management`     |
| Analytics Center   | Reports             | `/reports`                | `reports`             |
| Data Trust Score   | Data Quality Rating | `/data-quality-rating`    | `data quality rating` |

> The **Settings → Authorizations** admin screen still shows the old module
> names because they key the backend permission records. Renaming those would
> require a coordinated backend migration.

## PCF Results & Validation tabs (Footprint Connect detail page)

Display labels only; the Ant Design tab state keys
(`overview` / `emissions` / `transport` / `allocation`) are unchanged.

| New label           | Old label  |
| ------------------- | ---------- |
| Footprint Overview  | Overview   |
| Emissions Breakdown | Emissions  |
| Logistics Impact    | Transport  |
| Allocation Method   | Allocation |

## PCF detail page (D2) redesign — `PCFRequestView.tsx`

The Footprint Connect detail page was aligned to the "PCF Detail - D2 Header
Band" design:

- Green gradient **header band** (title + status pill, Total Carbon Footprint
  metric, Weight/Stages/Cost/Priority chips) over an 8-field detail grid.
- Horizontal **stage tracker** + completion banner.
- **Status cards**: Data Collection + Data Quality Rating, equal-height.
- **Results & Validation** tabs (see above).
- Section cards use an 18px corner radius; breakdown tiles use exact design hexes
  with a gradient Grand Total tile.

### Overview tab — `BomTable` `variant="detail"`

`src/features/pcf-create/BomTable.tsx` gained a `variant` prop. The detail page
passes `variant="detail"`; the **PCF-create flow keeps the default variant
unchanged**. In detail mode:

- No Price column; auto-height (no inner scroll/sticky footer); a separate
  3-metric strip (Components / Total Weight / Total Cost) below the table.
- Expanding a row shows **Component Details + an Emissions Graph bar chart**.
- The standalone right-side Supplier Information panel was removed (supplier
  details still appear in the summary card higher on the page).

### Emissions tab

Shows the per-component emissions **table** (Component / Material No. / per-stage
values / Total PCF / % Total) followed by the **Material Composition Breakdown**
(per-material progress bars), matching the D2 design.
