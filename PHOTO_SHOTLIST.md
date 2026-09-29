# Photographs this site is waiting for

The site runs today on three atmospheric placeholders (`public/img/`). They are deliberately
uncaptioned — none of them is a place, and none pretends to be. Swapping in the company's
own pictures is one edit to `PHOTOS` in `src/lib/images.ts`; nothing else changes.

Any subset can be supplied. Every slot falls back on its own, so half a set never leaves an
empty box on a page.

## What to shoot

| Slot | What | Shape | Where it appears |
|---|---|---|---|
| `hero` | A clean car on an open road, sky above and empty — the headline sits in that sky | Landscape, 3:2 or wider, ≥ 2400px | Home hero |
| `fleet.dzire` | The Dzire, three-quarter front, whole car in frame | 3:2, ≥ 2000px | Fleet rail, vehicle pages |
| `fleet.ertiga` | The Ertiga, **same angle, same light** | 3:2, ≥ 2000px | as above |
| `fleet.crysta` | The Crysta, same angle, same light | 3:2, ≥ 2000px | as above |
| `fleet.tempo_traveller` | The Tempo Traveller, same angle, same light | 3:2, ≥ 2000px | as above |
| `driver` | A driver in uniform beside the car, face clear | Portrait or 3:2, ≥ 2000px | "Drivers we know" |
| `interior` | Inside the car: clean seats, water bottles, daylight | 3:2, ≥ 2000px | About, trust sections |

## The four rules that matter more than the camera

1. **The four fleet photographs must match.** Same angle, same time of day, same background
   if possible. Four cars shot four different ways look like four different companies.
2. **Daylight, and no flash.** Late morning or the hour before sunset. A car under a
   showroom light reads as a stock photograph.
3. **A number plate is fine; a face is not, without permission.** The driver photograph
   needs that person's clear agreement, in writing if you can.
4. **No text, no logo, no border baked into the image.** The page adds its own.

## Delivering them

- JPG, full size, straight out of the camera or phone. Do not resize or compress first —
  Next re-encodes each one to AVIF/WebP at the width the device asks for, and it does a
  better job from the original.
- Drop them in `public/img/` with short names: `hero.jpg`, `dzire.jpg`, `interior.jpg`.
- Then fill in `PHOTOS` in `src/lib/images.ts` — for example `hero: '/img/hero.jpg'`.
- Build once and check the home page, a vehicle page and About.

A photograph of the actual cars does more for how this site feels than anything left in the
code.
