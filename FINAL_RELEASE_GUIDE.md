# FINAL RELEASE & DEPLOYMENT GUIDE

This master checklist and deployment guide walks through the final stages of consolidating, merging, securing, and deploying the Real Estate Management system.

---

## 📋 Table of Contents
1. [Milestone 1: Final Code Sanity & Crash Prevention](#milestone-1-final-code-sanity--crash-prevention)
2. [Milestone 2: Automated Conflict-Free Merge Sequencing](#milestone-2-automated-conflict-free-merge-sequencing)
3. [Milestone 3: Database Shielding Blueprint (Supabase SQL RLS)](#milestone-3-database-shielding-blueprint-supabase-sql-rls)
4. [Milestone 4: Cloud Infrastructure & Vercel Deployment Settings](#milestone-4-cloud-infrastructure--vercel-deployment-settings)

---

## Milestone 1: Final Code Sanity & Crash Prevention

Verify that all components are fully reactive, optimized, and crash-resistant.

- [ ] **Task 1.1: Verify split flex-layout in `src/components/Home/ListingMapView.jsx`**
  - Verify that the Zustand store handles filtering reactivity correctly via `selectFilteredHouses`.
  - Verify that the layout splits screen real estate on desktop (`lg` screen sizes) into a left-hand scrollable search/results view and a right-hand sticky maps view.
  
  *Drop-in validation code implementation for [ListingMapView.jsx](file:///E:/personal/work/real-estate-management/src/components/Home/ListingMapView.jsx):*
  ```jsx
  import React, { useEffect } from "react";
  import useSupabaseClient from "../../backend/supabase/supabase";
  import { Spin } from "antd";
  import Search from "./Search";
  import FilterDropdown from "./FilterDropdown";
  import Map from "./Map";
  import { useHouseStore, selectFilteredHouses } from "../../store/useHouseStore";
  import { useShallow } from "zustand/react/shallow";

  function ListingMapView() {
    const supabase = useSupabaseClient();
    const loading = useHouseStore((state) => state.loading);
    const initRealtimeSubscription = useHouseStore((state) => state.initRealtimeSubscription);
    const filteredHouses = useHouseStore(useShallow(selectFilteredHouses));

    useEffect(() => {
      if (supabase) {
        const unsubscribe = initRealtimeSubscription(supabase);
        return () => {
          if (unsubscribe) unsubscribe();
        };
      }
    }, [supabase, initRealtimeSubscription]);

    if (loading) {
      return <Spin size="large" className="flex my-48 justify-center" />;
    }

    // Format houses to markers format expected by Map component
    const markers = filteredHouses
      .filter((house) => house.is_available)
      .map((house) => ({
        property_id: house.property_id,
        lat: house.latitude,
        lng: house.longitude,
        address: house.address,
        price: house.price,
        bedrooms: house.Bedrooms,
        bathrooms: house.Bathrooms,
      }));

    return (
      <div className="mt-10 max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col items-center gap-2 w-full mb-6">
          <FilterDropdown />
        </div>
        
        {/* Responsive split layout: Stack on mobile, split on large screens */}
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Left side: Search input and property cards list */}
          <div className="w-full lg:w-1/2 flex-none">
            <Search />
          </div>
          
          {/* Right side: Sticky Map panel for visual geographical listings */}
          <div className="w-full lg:w-1/2 h-[500px] lg:h-[700px] lg:sticky lg:top-24 rounded-3xl overflow-hidden shadow-lg border border-gray-200 z-10">
            <Map markers={markers} />
          </div>
        </div>
      </div>
    );
  }

  export default ListingMapView;
  ```

- [ ] **Task 1.2: Verify null-safe guard in `src/pages/PropertyDetails.jsx`**
  - Verify that the `markers` `useMemo` hook is protected against a null `house` object during the initial data loading phase.
  
  *Null-safety check for [PropertyDetails.jsx](file:///E:/personal/work/real-estate-management/src/pages/PropertyDetails.jsx#L33-L46):*
  ```javascript
  const markers = useMemo(() => {
    if (!house) return []; // Critical Null-Safe Guard
    return [
      {
        property_id: house.property_id,
        lat: house.latitude,
        lng: house.longitude,
        address: house.address,
        price: house.price,
        bedrooms: house.Bedrooms,
        bathrooms: house.Bathrooms,
      },
    ];
  }, [house]);
  ```

---

## Milestone 2: Automated Conflict-Free Merge Sequencing

Follow this step-by-step pipeline to merge feature progress into main branches without introducing regressions.

- [ ] **Task 2.1: Commit and push changes on active branch**
  - Save your active workspace modifications on the `refactor/dependency-consolidation` branch.
  ```bash
  git add .
  git commit -m "chore: apply split flex-layout, integrate maps and add stability safeguards"
  git push origin refactor/dependency-consolidation
  ```

- [ ] **Task 2.2: Merge changes into develop**
  - Switch to the shared staging branch, synchronize with upstream remote changes, and merge the branch cleanly.
  ```bash
  git checkout develop
  git pull origin develop
  git merge refactor/dependency-consolidation
  ```
  - *If merge conflicts occur, proceed to [Git Merge Conflict Troubleshooting](#git-merge-conflict-troubleshooting).*
  - Push the successfully merged staging codebase:
  ```bash
  git push origin develop
  ```

- [ ] **Task 2.3: Merge develop into master (production)**
  - Switch to the main production branch (`master`), sync with the remote, pull `develop`, and deploy.
  ```bash
  git checkout master
  git pull origin master
  git merge develop
  git push origin master
  ```

### Git Merge Conflict Troubleshooting
If the terminal complains about a merge conflict, execute the following actions:
1. **Identify affected files:** Run `git status` to see files marked as `both modified`.
2. **Open the conflicted files:** Locate the Git conflict markers:
   ```text
   <<<<<<< HEAD
   (Changes from the destination branch - e.g., develop or master)
   =======
   (Changes from the incoming branch - e.g., refactor/dependency-consolidation)
   >>>>>>> refactor/dependency-consolidation
   ```
3. **Resolve the content:** Keep the desired logic, remove the conflict boundary markers (`<<<<<<<`, `=======`, `>>>>>>>`), and save.
4. **Finalize the merge:**
   ```bash
   git add <path-to-resolved-file>
   git commit -m "merge: resolve conflicts between develop and refactor/dependency-consolidation"
   git push origin <current-branch>
   ```

---

## Milestone 3: Database Shielding Blueprint (Supabase SQL RLS)

Paste the following production-ready PL/pgSQL script directly into the **Supabase Dashboard SQL Editor** to establish high-integrity Row Level Security (RLS) linked to Clerk Auth JWT headers.

- [ ] **Task 3.1: Execute Security Hardening SQL Script**
  ```sql
  -- ==========================================
  -- 1. PROPERTIES TABLE RLS POLICIES
  -- ==========================================
  
  -- Enable Row Level Security (RLS)
  ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist to prevent conflicts
  DROP POLICY IF EXISTS "Allow public read access on properties" ON public.properties;
  DROP POLICY IF EXISTS "Allow owners to insert properties" ON public.properties;
  DROP POLICY IF EXISTS "Allow owners to update properties" ON public.properties;
  DROP POLICY IF EXISTS "Allow owners to delete properties" ON public.properties;

  -- Read Policy: Anyone can browse property listings
  CREATE POLICY "Allow public read access on properties"
    ON public.properties
    FOR SELECT
    USING (true);

  -- Insert Policy: Users can only create properties where seller_id matches their authenticated Clerk User ID
  CREATE POLICY "Allow owners to insert properties"
    ON public.properties
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = seller_id);

  -- Update Policy: Users can only edit properties where seller_id matches their authenticated Clerk User ID
  CREATE POLICY "Allow owners to update properties"
    ON public.properties
    FOR UPDATE
    USING (auth.jwt() ->> 'sub' = seller_id)
    WITH CHECK (auth.jwt() ->> 'sub' = seller_id);

  -- Delete Policy: Users can only delete properties where seller_id matches their authenticated Clerk User ID
  CREATE POLICY "Allow owners to delete properties"
    ON public.properties
    FOR DELETE
    USING (auth.jwt() ->> 'sub' = seller_id);


  -- ==========================================
  -- 2. WISHLIST TABLE RLS POLICIES
  -- ==========================================

  -- Enable Row Level Security (RLS)
  ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist to prevent conflicts
  DROP POLICY IF EXISTS "Allow users to view their own wishlist" ON public.wishlist;
  DROP POLICY IF EXISTS "Allow users to add to their wishlist" ON public.wishlist;
  DROP POLICY IF EXISTS "Allow users to delete from their wishlist" ON public.wishlist;

  -- View Policy: Authenticated users can only see their own wishlist items
  CREATE POLICY "Allow users to view their own wishlist"
    ON public.wishlist
    FOR SELECT
    USING (auth.jwt() ->> 'sub' = user_id);

  -- Add Policy: Authenticated users can only add entries mapping to their own User ID
  CREATE POLICY "Allow users to add to their wishlist"
    ON public.wishlist
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

  -- Delete Policy: Authenticated users can only remove items from their own wishlist
  CREATE POLICY "Allow users to delete from their wishlist"
    ON public.wishlist
    FOR DELETE
    USING (auth.jwt() ->> 'sub' = user_id);
  ```

---

## Milestone 4: Cloud Infrastructure & Vercel Deployment Settings

Host the application live on Vercel with correct environment configurations and verify operational readiness.

### Environment Variable Checklist
Ensure the following keys are set up in **Vercel Project Settings > Environment Variables** for the `Production` environment:

- [ ] **`VITE_CLERK_PUBLISHABLE_KEY`**
  - *Source:* Clerk Dashboard > API Keys.
  - *Description:* Key authorizing the frontend login widgets and Clerk context.
- [ ] **`VITE_SUPABASE_URL`**
  - *Source:* Supabase Dashboard > Project Settings > API.
  - *Description:* Your dedicated Supabase project URL endpoint.
- [ ] **`VITE_SUPABASE_ANON_KEY`**
  - *Source:* Supabase Dashboard > Project Settings > API.
  - *Description:* The client-safe anonymous API key.

---

### Post-Deployment Verification Routines

Once Vercel finishes the build, navigate to the live URL and complete these verification checks:

- [ ] **1. Asset Chunking & Build Integrity**
  - Open Chrome DevTools (`F12`), navigate to the **Network** tab, and reload the page.
  - Inspect the loaded JS/CSS assets. Verify that Vite successfully generated chunked files (e.g., `index-[hash].js`, `Map-[hash].js`) and that there are no red 404/500 asset fetch errors.

- [ ] **2. Authenticated Session Handshake**
  - Click **Sign In**, complete Clerk authentication, and navigate around.
  - Inspect the browser console. Verify that no Auth errors occur.
  - Inspect outgoing API requests to Supabase (in the Network tab). Verify that the header contains `Authorization: Bearer <clerk-jwt-token>`.

- [ ] **3. WebSockets & Real-Time Sync Triggers**
  - Open two separate browser tabs side-by-side:
    - Tab A: Main landing listing search panel.
    - Tab B: Supabase Table Editor or a client session creating a new property record.
  - Insert or mutate a property record in public/properties.
  - Verify that Tab A's list and map marker display updates instantly without requiring a page refresh. This confirms the WebSocket channel (`properties-realtime-zustand`) is active and successfully updating client state dynamically.
