# Task 15-16: Customer Dashboard & Admin Dashboard

## Agent: Dashboard Builder

## Summary

Created two comprehensive dashboard components for the NextShop e-commerce application:

### File 1: `src/components/ecommerce/CustomerDashboard.tsx`
- **Layout**: Responsive sidebar navigation (desktop: fixed sidebar, mobile: Sheet/drawer)
- **Profile Tab**: Large avatar with camera overlay, user info display, inline edit form (name/email/phone) with save/cancel
- **Orders Tab**: Desktop table + mobile card views, colored status badges (pending=yellow, confirmed=emerald, processing=orange, shipped=cyan, delivered=green, cancelled=red), click-to-view order detail panel with items/summary/payment info/tracking
- **Wishlist Tab**: Grid of product cards with image, price, rating stars, "Add to Cart" and "Remove" buttons, discount percentage badges
- **Addresses Tab**: Card list with default highlight (emerald border), Add/Edit dialog with full form fields, Set Default and Delete actions
- **Notifications Tab**: List with type-based icons, unread highlight (emerald bg), mark-as-read on click, relative time display
- **Settings Tab**: Change password form (current/new/confirm with validation), appearance note, delete account with "DELETE" confirmation text
- **Data fetching**: useEffect on mount fetching orders, addresses, notifications via API endpoints with graceful fallback
- **Auth gate**: Shows login prompt when not authenticated

### File 2: `src/components/ecommerce/AdminDashboard.tsx`
- **Layout**: Same responsive sidebar/Sheet pattern, admin badge (red)
- **Overview Tab**:
  - 4 stat cards (Revenue/Orders/Users/Products) with ৳ currency, growth %, TrendingUp/Down icons
  - Revenue AreaChart (emerald gradient, past 30 days from analyticsData store)
  - Daily Orders BarChart (orange bars)
  - Recent Orders table (latest 5, with "View All" link to Orders tab)
  - Order Status PieChart (donut, 5-color palette: emerald/amber/rose/cyan/violet)
  - Top 5 Products by soldCount with rank, image, name, sold count, price
- **Orders Tab**: Search bar, status filter Select, full table with inline status dropdown (updatable), pagination
- **Products Tab**: Search, table with image/name/category/price/stock/status, stock badges (In Stock=green, Low Stock=yellow, Out of Stock=red)
- **Users Tab**: Table with avatar/name/email, role badges (admin=red, seller=orange, customer=green), active status
- **Coupons Tab**: Table with code (monospace), type/value, min purchase, progress bar for usage, status badge, create button
- **Reviews Tab**: Table with product/user avatar/rating stars/comment/verified status/date
- **Settings Tab**: General settings form (store name, currency, shipping, tax), Danger Zone (reset data)
- **Auth gate**: Shows admin access required when not admin

### Key Technical Decisions
- All `useMemo` hooks placed before early return to satisfy React hooks rules
- Renamed Lucide `Image` import to `ImageIcon` to avoid false-positive ESLint alt-text warning
- No indigo/blue colors used — emerald as primary accent throughout
- Tables use `max-h-96 overflow-y-auto` with custom scrollbar CSS
- Charts wrapped in `ResponsiveContainer` with proper width/height
- Recharts Tooltip formatters handle BDT ৳ currency formatting
- Custom scrollbar styles injected via `<style>` tag for `.dashboard-scroll` and `.admin-scroll`

### Lint Status
- ✅ Zero errors, zero warnings