# React + Vite - Real Estate Management

## Table of contents

- [Overview](#overview)
  - [Team members](#team-members)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
- [Author](#author)

## Overview

### Team members

- Abdallah Edrees [Team-leader]
- Shahd AlSayed
- Emad Mostafa
- Yousef Halawa
- Rana Amr

### Screenshot

![Desktop Preview 1](./src/assets/img/Screenshot.png)
![Desktop Preview 2](./src/assets/img/Screenshot2.png)
![Desktop Preview 3](./src/assets/img/Screenshot3.png)

### Links

- Code URL: (https://github.com/abdallahedreeso/real-estate-management)

- Deployment (Vercle) URL: (https://real-estate-management-mu.vercel.app/)

- Presentation URL: (https://docs.google.com/presentation/d/18HFNo-JX4dboGwW9HEB05ByOMCMeOB_D/edit?usp=sharing&ouid=101104021309986710436&rtpof=true&sd=true)

- Proposal URL: (https://docs.google.com/document/d/1vuSesYbvglFRYP84SxC5njGoCeFObM9x/edit?usp=sharing&ouid=101104021309986710436&rtpof=true&sd=true)

## My process

### Built with

- React.js - Vite
- Supabase
- AntDesign & Tailwind
- Clerk

### Shared link previews

The homepage includes a 1200×630 branded image and Open Graph/X metadata. Vercel routes `/property/:id` through `api/property-preview.js`, which serves the same app shell with listing-specific title, description, and public photo metadata. It reads only publicly available properties with the Supabase anon key. Configure `SITE_URL` when deploying on a different domain; Vercel's production URL is used automatically when available. Regenerate the homepage image with `node scripts/generate-link-preview.mjs`.

## Author

- Component Crafterz
