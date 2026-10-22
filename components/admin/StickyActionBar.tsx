/**
 * StickyActionBar.tsx — the dark Save / Discard / Publish bar of an admin panel,
 * pinned to the top of the window while the panel scrolls.
 *
 * Render it as a direct child of the panel's root element: `sticky` only holds
 * within its parent, so nesting it deeper would let it scroll away. Below lg it
 * sits under the 65px mobile top bar (sticky top-0 in app/admin/page.tsx).
 */

export default function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-[4.5rem] z-20 lg:top-3">
      <div className="flex flex-col gap-3 rounded-2xl bg-[#0B1120] px-4 py-3 text-white shadow-float-lg sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
        {children}
      </div>
    </div>
  );
}
