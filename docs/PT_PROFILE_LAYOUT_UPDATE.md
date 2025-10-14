# PTProfileScreen Layout Update - ProfileScreen Style

## Overview
Updated `PTProfileScreen` to match the `ProfileScreen` layout structure while maintaining FreelancePT-specific content.

## Layout Structure (Now Matching ProfileScreen)

### 1. **Header with Gradient** (LinearGradient)
- Orange to pink gradient (#FF914D → #ED2A46)
- Avatar with rating badge overlay
- Trainer name and description
- Info badges (experience years + total clients)

### 2. **Quick Stats Cards** (Floating Cards)
- Three stat cards overlapping gradient section
- **Card 1:** Experience Years (medal icon)
- **Card 2:** Rating (star icon, gold color)
- **Card 3:** Total Clients (people icon)
- Negative margin (-30) to overlap gradient

### 3. **Pricing Information Section**
- Card layout matching ProfileScreen's health metrics
- Icon + label + value layout
- Cash icon
- "From X VND" display
- "Per Session" subtitle

### 4. **Trainer Information Section**
- Form-style layout like ProfileScreen
- Section header with title
- Input groups with labels and icons

#### Sub-sections:
- **Specializations** (fitness icon)
  - Tag-based display
  - Pink background tags
  
- **Certifications** (ribbon icon)
  - List of certification cards
  - Gray background items

- **About/Bio** (information icon)
  - Text display in disabled input style
  - Fallback to description if bio not available

### 5. **Action Buttons**
- Two-button layout (side by side)
- **Primary:** Book Session (orange, full color)
- **Secondary:** Contact (white with orange border)

## Visual Comparison

### Before (Custom Layout)
```
┌─────────────────────────┐
│ Header with back button │
├─────────────────────────┤
│  Gradient + Avatar      │
│  Name + Description     │
│  Badges                 │
└─────────────────────────┘
┌─────────────────────────┐
│  Price Card (centered)  │
└─────────────────────────┘
┌─────────────────────────┐
│  Specializations        │
│  (separate section)     │
└─────────────────────────┘
┌─────────────────────────┐
│  Certifications         │
│  (separate section)     │
└─────────────────────────┘
┌─────────────────────────┐
│  About                  │
│  (separate section)     │
└─────────────────────────┘
┌─────────────────────────┐
│  [ Book ]  [ Contact ]  │
└─────────────────────────┘
```

### After (ProfileScreen Style)
```
┌─────────────────────────┐
│  Gradient + Avatar      │
│  Name + Description     │
│  Badges                 │
└─────────────────────────┘
┌───────┐ ┌───────┐ ┌───────┐
│Years  │ │Rating │ │Clients│ <- Floating
└───────┘ └───────┘ └───────┘
┌─────────────────────────┐
│  Pricing Information    │
│  ┌───────────────────┐  │
│  │ $ | From X VND    │  │
│  │   | Per Session   │  │
│  └───────────────────┘  │
└─────────────────────────┘
┌─────────────────────────┐
│  Trainer Information    │
│  ┌───────────────────┐  │
│  │ Specializations   │  │
│  │ [Tag] [Tag] [Tag] │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Certifications    │  │
│  │ • ACE             │  │
│  │ • NASM            │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ About             │  │
│  │ Bio text here...  │  │
│  └───────────────────┘  │
└─────────────────────────┘
┌─────────────────────────┐
│  [ Book ]  [ Contact ]  │
└─────────────────────────┘
```

## Key Changes

### Removed Components
- ❌ Custom header with back button (using default navigation)
- ❌ SafeAreaView wrapper
- ❌ Separate price floating card
- ❌ Independent section containers for each info type

### Added/Modified Components
- ✅ Three-card stats section (matching ProfileScreen BMI stats layout)
- ✅ Health card-style price display (icon + info + value)
- ✅ Form container with input groups
- ✅ Consistent spacing and styling with ProfileScreen
- ✅ Section headers with titles

## Style Consistency

### Matching ProfileScreen Styles
```javascript
// Stats cards
statsContainer: { marginTop: -30, zIndex: 10 }
statCard: { flex: 1, marginHorizontal: 4 }

// Section containers
sectionContainer: { margin: 16, borderRadius: 16, padding: 20 }
sectionHeader: { flexDirection: "row", marginBottom: 16 }

// Health card style (for price)
healthCard: { backgroundColor: "#f8f9fa", padding: 16 }
healthHeader: { flexDirection: "row", alignItems: "center" }

// Form layout
formContainer: { gap: 16 }
inputGroup: { marginBottom: 8 }
inputLabel: { fontSize: 14, marginBottom: 8 }

// Disabled input style (for read-only content)
disabledInput: { backgroundColor: "#f8f9fa", color: "#666" }
```

## Translation Keys Added

### English
```json
"years": "years"
"rating": "rating"
"clients": "clients"
"pricing": "Pricing Information"
"trainerInfo": "Trainer Information"
```

### Vietnamese
```json
"years": "năm"
"rating": "đánh giá"
"clients": "khách hàng"
"pricing": "Thông Tin Giá"
"trainerInfo": "Thông Tin Huấn Luyện Viên"
```

## Benefits of New Layout

1. **Consistency:** Matches app-wide profile screen design pattern
2. **Familiar UX:** Users recognize the layout from their own profile
3. **Better Organization:** Info grouped logically in form-style sections
4. **Visual Hierarchy:** Stats cards draw attention, then detailed info below
5. **Responsive:** Works well on all screen sizes
6. **Maintainable:** Reuses existing style patterns

## Component Hierarchy

```
ScrollView
├── LinearGradient (Header)
│   └── Avatar + Name + Badges
├── Stats Container (3 cards)
│   ├── Experience Card
│   ├── Rating Card
│   └── Clients Card
├── Section Container (Pricing)
│   └── Health Card Style
│       └── Icon + Info + Value
├── Section Container (Trainer Info)
│   └── Form Container
│       ├── Input Group (Specializations)
│       ├── Input Group (Certifications)
│       └── Input Group (About)
└── Action Container
    ├── Primary Button (Book)
    └── Secondary Button (Contact)
```

## Data Flow

```javascript
// Props received
route.params = {
  ptId: number,
  pt: {
    fullName, avatarUrl, description,
    rating, experienceYears, totalPurchased,
    goalTrainingList[], certifications[],
    priceFrom, bio
  }
}

// Display logic
- If no pt data → fetch via ptService.getPTDetail(ptId)
- Stats shown conditionally (if data exists)
- Specializations shown as tags
- Certifications shown as list items
- Bio/description shown in disabled input style
```

## Testing Checklist

- [ ] Layout matches ProfileScreen structure
- [ ] Stats cards overlap gradient correctly
- [ ] Price section displays with health card style
- [ ] Specializations render as tags
- [ ] Certifications render as list
- [ ] Bio/description displays correctly
- [ ] Action buttons work (Book + Contact)
- [ ] Loading state shows correctly
- [ ] Error state shows correctly
- [ ] Translations display correctly (EN/VI)
- [ ] Navigation back works
- [ ] All icons display correctly

## Future Enhancements

- [ ] Add edit mode for PT's own profile view
- [ ] Add reviews section in similar form layout
- [ ] Add availability calendar widget
- [ ] Add share profile functionality
- [ ] Add favorite/bookmark button
