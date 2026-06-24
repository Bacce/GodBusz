# GödBusz Client — Code Review & Improvement Plan

> Review of the `client/` application — a Vite + React + TypeScript + Tailwind v4 app showing bus routes, stops, and real-time vehicle tracking on a Leaflet map.

---

## Table of Contents

1. [Architecture & Code Organization](#1-architecture--code-organization)
2. [TypeScript & Type Safety](#2-typescript--type-safety)
3. [Performance](#3-performance)
4. [Data Fetching & State Management](#4-data-fetching--state-management)
5. [Component Design](#5-component-design)
6. [Styling Consistency](#6-styling-consistency)
7. [UX & Accessibility](#7-ux--accessibility)
8. [Configuration & Build](#8-configuration--build)
9. [Priority Summary](#9-priority-summary)

---

## 1. Architecture & Code Organization

### Current State

All 7 source files live in a flat `src/` directory with no subdirectories:

```
src/
  App.tsx          ← ~287 lines, contains ALL application logic
  Pill.tsx
  Plate.tsx
  RoutingMachine.tsx
  Timetable.tsx
  index.css
  main.tsx
```

`App.tsx` is a **god component** — it owns:
- All state (stops, buses, polling, selectedRoute, popup)
- All data fetching logic (3 separate `fetch` functions)
- All Leaflet icon creation and rotation mapping
- Map event handling
- The popup/modal overlay
- Header bar UI

### Recommendations

**A. Introduce a folder structure** to separate concerns:

```
src/
  components/
    map/
      MapView.tsx           ← MapContainer + TileLayer + markers
      StopMarker.tsx        ← single stop marker + popup
      BusMarker.tsx         ← single bus marker + popup
      MapClickHandler.tsx   ← currently inline component
    ui/
      Pill.tsx
      Plate.tsx
      Timetable.tsx
      PopupModal.tsx        ← the announcement overlay
      Header.tsx
  hooks/
    useStops.ts
    useBuses.ts
    usePopups.ts
    useMapPersistence.ts    ← localStorage center/zoom
  lib/
    icons.ts                ← bus icons, stop icons, rotation map
    constants.ts            ← bounds, colors, API endpoints
    types.ts                ← shared TypeScript interfaces
  api/
    client.ts               ← thin fetch wrapper
  App.tsx
  main.tsx
  index.css
```

**B. Extract `MapClickHandler` out of `App.tsx`.**
Currently it's defined *inside* the component body, which means it gets re-created on every render. It should be a standalone component imported into the map view.

```diff
-  const MapClickHandler = () => {
-    useMapEvents({ ... });
-    return null;
-  };
```

Move to `components/map/MapClickHandler.tsx` and accept callbacks via props.

**C. Move hardcoded constants to a dedicated file.**
`STOP_ROTATIONS`, `bounds`, bus icon URLs, and color codes (`#009ee3`, `#e41f18`) are scattered throughout JSX. Centralizing them improves maintainability and makes route additions trivial.

---

## 2. TypeScript & Type Safety

### Current State

> [!CAUTION]
> The app is nominally TypeScript but uses `any` pervasively, losing nearly all type-safety benefits.

Specific issues:

| File | Issue |
|------|-------|
| [App.tsx:16-17](file:///home/bence/Development/GödBusz/client/src/App.tsx#L16-L17) | `useState<any[]>([])` for both `stops` and `buses` |
| [App.tsx:20](file:///home/bence/Development/GödBusz/client/src/App.tsx#L20) | `useState<any \| null>(null)` for popup |
| [App.tsx:22](file:///home/bence/Development/GödBusz/client/src/App.tsx#L22) | `useRef<any[]>([])` for lastBusesRef |
| [Pill.tsx:1](file:///home/bence/Development/GödBusz/client/src/Pill.tsx#L1) | Untyped props `({ variant, children })` |
| [Plate.tsx:1](file:///home/bence/Development/GödBusz/client/src/Plate.tsx#L1) | Untyped props `({ children })` |
| [Timetable.tsx:1](file:///home/bence/Development/GödBusz/client/src/Timetable.tsx#L1) | Untyped props `({ trips })` |
| [RoutingMachine.tsx:7](file:///home/bence/Development/GödBusz/client/src/RoutingMachine.tsx#L7) | `options?: any` in interface |

### Recommendations

**A. Define domain types in a shared file:**

```typescript
// src/lib/types.ts

export type RouteId = "G3" | "G4";

export interface Trip {
  time: string;
  nev?: string;
  sd?: string;
  ed?: string;
}

export interface Stop {
  mid: string;
  lat: number;
  lon: number;
  route: RouteId;
  name: string;
  trips: Trip[];
}

export interface BusPosition {
  lat: number;
  lon: number;
  rendszam: string;
  speed: number;
  route: RouteId;
  lastUpdate: string;
}

export interface PopupMessage {
  title: string;
  txt: string;
}
```

**B. Type all component props** using interfaces:

```typescript
interface PillProps {
  variant: RouteId;
  children: React.ReactNode;
}

interface TimetableProps {
  trips: Trip[];
}
```

**C. Replace `any` in state hooks:**

```diff
-  const [stops, setStops] = useState<any[]>([]);
+  const [stops, setStops] = useState<Stop[]>([]);
```

**D. Enable stricter TypeScript checks** — consider adding `strict: true` to `tsconfig.app.json` (it's currently not set, which defaults to false).

---

## 3. Performance

### Current State

Several patterns create unnecessary work on every render.

### Recommendations

**A. Memoize Leaflet icons.**
`busIconG3`, `busIconG4`, and `getStopIcon()` are recreated on every render of `App`. Since they depend on static data, they should be module-level constants or `useMemo`'d:

```diff
// Move outside the component
+const busIconG3 = L.icon({ ... });
+const busIconG4 = L.icon({ ... });
```

For `getStopIcon`, use a cache Map keyed by `(route, rotation)`:

```typescript
const stopIconCache = new Map<string, L.DivIcon>();

const getStopIcon = (route: RouteId, rotation?: number): L.DivIcon => {
  const key = `${route}-${rotation}`;
  if (!stopIconCache.has(key)) {
    stopIconCache.set(key, L.divIcon({ /* ... */ }));
  }
  return stopIconCache.get(key)!;
};
```

**B. Stop deep-comparing bus positions with `JSON.stringify`.**
[App.tsx:122](file:///home/bence/Development/GödBusz/client/src/App.tsx#L122) uses `JSON.stringify` comparison which is O(n) on every 2-second poll. Consider comparing a hash or checking individual position changes, or at minimum comparing `.length` and a sample of entries first:

```diff
-if (JSON.stringify(positions) === JSON.stringify(lastBusesRef.current)) {
+if (positions.length === lastBusesRef.current.length &&
+    positions.every((p, i) => 
+      p.lat === lastBusesRef.current[i].lat && 
+      p.lon === lastBusesRef.current[i].lon)) {
```

**C. Avoid filtering stops on every render.**
The stop filtering logic at [App.tsx:191-197](file:///home/bence/Development/GödBusz/client/src/App.tsx#L191-L197) runs on every render. Use `useMemo`:

```typescript
const filteredStops = useMemo(
  () => selectedRoute 
    ? stops.filter(s => s.route === selectedRoute) 
    : stops,
  [stops, selectedRoute]
);
```

**D. Use stable keys for markers.**
Both stop and bus markers use array index `i` as the key ([App.tsx:198](file:///home/bence/Development/GödBusz/client/src/App.tsx#L198), [App.tsx:216](file:///home/bence/Development/GödBusz/client/src/App.tsx#L216)). Use stable identifiers:

```diff
-  .map((stop, i) => <Marker key={i} ...>)
+  .map((stop) => <Marker key={stop.mid} ...>)

-  buses.map((bus, i) => <Marker key={i} ...>)
+  buses.map((bus) => <Marker key={bus.rendszam} ...>)
```

---

## 4. Data Fetching & State Management

### Current State

Three raw `fetch` calls sit inside `App.tsx` with minimal error handling. No loading states, no retry logic, no request cancellation.

### Recommendations

**A. Extract data fetching into custom hooks:**

```typescript
// src/hooks/useStops.ts
export function useStops() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch("/api/v1/stops", { signal: controller.signal })
      .then(res => res.json())
      .then(json => setStops(json.stops || json))
      .catch(e => { if (e.name !== 'AbortError') setError(e); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { stops, loading, error };
}
```

**B. Add loading and error UI states.**
Currently the app shows a blank map while data loads, and silently swallows errors. Consider:
- A loading spinner or skeleton
- An error banner with retry button
- Toast notifications for transient network failures

**C. Centralize the API base URL.**
The API base path `/api/v1` is repeated in every fetch call and in the Vite proxy config. Define it once:

```typescript
// src/api/client.ts
const API_BASE = "/api/v1";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

**D. Add `AbortController` to the polling effect.**
The bus polling effect at [App.tsx:143-152](file:///home/bence/Development/GödBusz/client/src/App.tsx#L143-L152) has no cleanup for in-flight requests. If the component unmounts or polling is toggled off while a request is pending, it can cause state updates on unmounted components.

**E. Consider moving to a lightweight data-fetching library** like [SWR](https://swr.vercel.app/) or [TanStack Query](https://tanstack.com/query). They provide caching, deduplication, retry, and stale-while-revalidate out of the box — solving multiple issues at once. This is optional if you prefer staying dependency-light.

---

## 5. Component Design

### Current State

Components are minimal but have some design issues.

### Recommendations

**A. Extract the popup/modal overlay** ([App.tsx:261-283](file:///home/bence/Development/GödBusz/client/src/App.tsx#L261-L283)) into its own component:

```typescript
// src/components/ui/PopupModal.tsx
interface PopupModalProps {
  title: string;
  html: string;
  onClose: () => void;
}
```

> [!WARNING]
> `dangerouslySetInnerHTML` at [App.tsx:279](file:///home/bence/Development/GödBusz/client/src/App.tsx#L279) is a **security risk**. The popup content comes from an external API (`getPopup`). If that API is compromised or returns malicious HTML, it enables XSS attacks. Consider sanitizing with a library like [DOMPurify](https://github.com/cure53/DOMPurify):
> ```typescript
> import DOMPurify from 'dompurify';
> dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(popup.txt) }}
> ```

**B. Extract the header bar** into a `Header` component. It currently mixes layout concerns with polling state management.

**C. The `Timetable` component uses a mutable variable pattern** (`let nextFound = false` at [line 3](file:///home/bence/Development/GödBusz/client/src/Timetable.tsx#L3)) inside the render body. While it works, it's fragile. Consider computing the "next trip" index first, then using it during render:

```typescript
const nextIndex = trips.findIndex(t => !t.time.startsWith("00:00") && t.time >= now);
```

**D. Stop filter logic has a bug** — at [App.tsx:197](file:///home/bence/Development/GödBusz/client/src/App.tsx#L197), `return stop` returns a truthy object instead of `return true`:

```diff
-.filter((stop) => {
-  if (selectedRoute !== null) {
-    return stop.route === selectedRoute;
-  }
-  return stop;  // ← returns the object, not `true`
-})
+.filter((stop) => !selectedRoute || stop.route === selectedRoute)
```

---

## 6. Styling Consistency

### Current State

The project uses three different styling approaches simultaneously:

| Approach | Where |
|----------|-------|
| Tailwind utility classes | `App.tsx`, `Pill.tsx`, `Plate.tsx` |
| Custom CSS classes | `index.css` (stop icons) |
| Inline `style` objects | `Timetable.tsx` (all styles) |

### Recommendations

**A. Pick one primary approach and be consistent.**
Since Tailwind v4 is already installed and used in most components, migrate `Timetable.tsx` from inline styles to Tailwind classes:

```diff
-<div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", ... }}>
+<div className={`flex justify-between py-1 border-b border-gray-100 ${isPast ? "text-gray-300" : isNext ? "text-black font-bold bg-gray-50" : ""}`}>
```

**B. Extract repeated color values into CSS custom properties or a Tailwind theme extension.**
`#009ee3` and `#e41f18` appear in 5+ places across TSX and CSS files. Define them once:

```css
/* index.css */
@theme {
  --color-g3: #009ee3;
  --color-g4: #e41f18;
}
```

Then use as `bg-g3`, `text-g4`, `border-g3`, etc.

**C. Deduplicate the stop icon CSS.**
`.stop-iconG3` and `.stop-iconG4` are identical except for `border-color`. Use a single class with a CSS variable:

```css
.stop-icon {
  width: 20px;
  height: 20px;
  border: 3px solid var(--stop-color);
  background: white;
  border-radius: 20px;
  transform-origin: center center;
  transform: rotate(calc(var(--rotate) - 90deg));
}
```

---

## 7. UX & Accessibility

### Recommendations

**A. Add `aria-label` attributes to interactive elements.**
The polling toggle button ([App.tsx:159-169](file:///home/bence/Development/GödBusz/client/src/App.tsx#L159-L169)) has no accessible label beyond Hungarian text. The close button on the popup modal is just a `✕` character with no `aria-label`.

```diff
  <button
+   aria-label={polling ? "Járműkövetés kikapcsolása" : "Járműkövetés bekapcsolása"}
    onClick={() => setPolling(!polling)}
```

```diff
  <button
+   aria-label="Bezárás"
    className="absolute top-4 right-4 ..."
    onClick={() => setPopup(null)}
```

**B. Add a loading indicator for bus tracking.**
When the user enables tracking, there's no visual feedback until bus data arrives (or if the API is slow). Show a loading spinner on the button or a small indicator on the map.

**C. Add `<meta name="description">` to `index.html`.**
Currently missing — important for SEO if the app is publicly deployed.

**D. The external Leaflet CSS is loaded from unpkg CDN** ([index.html:11](file:///home/bence/Development/GödBusz/client/index.html#L11)). Consider bundling it or using the npm package to avoid CDN dependency and improve load performance.

**E. Duplicate `<link rel="icon">` tags** in `index.html` — lines 5 and 8 both set favicons. Consolidate to one.

---

## 8. Configuration & Build

### Recommendations

**A. The TileLayer URL is hardcoded to `localhost:3000`:**

```typescript
// App.tsx:184
url="http://localhost:3000/Tiles/{z}/{x}/{y}.png"
```

This will break in production. Use a relative URL or environment variable:

```diff
-url="http://localhost:3000/Tiles/{z}/{x}/{y}.png"
+url="/Tiles/{z}/{x}/{y}.png"
```

Same issue with the OSRM service URL at [App.tsx:241](file:///home/bence/Development/GödBusz/client/src/App.tsx#L241):

```diff
-serviceUrl: "http://localhost:3000/api/v1/route-proxy"
+serviceUrl: "/api/v1/route-proxy"
```

**B. Add environment variable support** via Vite's `import.meta.env` for any URLs that differ between dev/staging/prod.

**C. The `favicon.svg` referenced in `index.html` line 5 doesn't exist** in the `public/` directory (only `icon.png` and `logo_godgo.png` are present). This causes a 404 on every page load.

**D. Consider adding path aliases** in `tsconfig.app.json` and `vite.config.ts` for cleaner imports once the folder structure grows:

```json
// tsconfig.app.json
"paths": { "@/*": ["./src/*"] }
```

---

## 9. Priority Summary

| Priority | Area | Impact | Effort |
|----------|------|--------|--------|
| 🔴 Critical | Fix hardcoded `localhost` URLs | App won't work in production | Low |
| 🔴 Critical | Sanitize `dangerouslySetInnerHTML` | XSS vulnerability | Low |
| 🟠 High | Add TypeScript types, remove `any` | Prevents runtime bugs | Medium |
| 🟠 High | Extract components from `App.tsx` | Maintainability | Medium |
| 🟠 High | Create folder structure | Scalability | Medium |
| 🟡 Medium | Memoize icons & filtered data | Render performance | Low |
| 🟡 Medium | Use stable marker keys | React reconciliation | Low |
| 🟡 Medium | Extract custom hooks for data fetching | Separation of concerns | Medium |
| 🟡 Medium | Unify styling approach | Consistency | Medium |
| 🟢 Low | Add loading/error states | User experience | Medium |
| 🟢 Low | Accessibility improvements | Inclusivity | Low |
| 🟢 Low | Fix missing favicon, duplicate link tags | Polish | Low |
| 🟢 Low | Path aliases & env vars | DX | Low |

> [!TIP]
> **Suggested order of attack:** Fix the two 🔴 Critical items first (< 30 min of work), then tackle the type system and folder restructure together as a single refactoring pass.
