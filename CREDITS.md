# Photography

The dish photography in `frontend/public/images/` was **supplied by ZEESHAN**. The untouched
originals are kept in `source-photos/` (outside `public/`, so they are never published); the files the
site loads are resized and re-compressed copies (max 1600 px wide, JPEG quality 72–80) for the web.

| File in `frontend/public/images/` | Dish | Appears on |
| --- | --- | --- |
| `menu-chicken-lollipop.jpg` | Chicken Lollipop | hero background, menu card, specials, gallery |
| `menu-chicken-pakodi.jpg` | Chicken Pakodi | menu card, specials, about, gallery |
| `menu-chicken-joint.jpg` | Chicken Joint | menu card, specials, Chicken category panel, gallery |
| `menu-reshma.jpg` | Chicken Reshmi Kabab (sold as “Reshma”) | menu card, gallery |
| `menu-vuda.jpg` | Chicken Vuda | menu card, about inset, gallery |

**Still a placeholder:** `category-mutton.jpg` — a mutton karahi from Wikimedia Commons
([File:Mutton Karahi 2.JPG](https://commons.wikimedia.org/wiki/File:Mutton_Karahi_2.JPG)) used in the
Mutton panel, because no mutton photograph has been supplied yet. Swap it the same way when one is
available.

**Replacing a photo later**

1. Put the new original in `source-photos/`.
2. Save a web version into `frontend/public/images/` at **≤ 1600 px wide** (JPEG quality ~75–80).
3. Update the `src`, `alt`, `width` and `height` for that entry in `frontend/src/data/images.ts`.

Several entries intentionally share one file (menu card + specials + gallery), so a single swap
updates every place that dish appears.

Typography: **Bodoni Moda** and **Inter**, both under the SIL Open Font License, served by Google Fonts.
Icons: **Lucide** (ISC licence).
