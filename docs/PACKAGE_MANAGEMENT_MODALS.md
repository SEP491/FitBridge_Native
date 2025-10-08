# Package Management Modals - Implementation Guide

## Overview
This document describes the Create and Edit package modal components for the FreelancePT Package Management feature.

## Components

### 1. CreatePackageModal.js
**Location:** `screens/FreelancePTScreen/ManagePackageScreen/CreatePackageModal.js`

**Purpose:** Modal for creating new PT packages

**Features:**
- ✅ Image picker with gallery permissions
- ✅ Form validation for all required fields
- ✅ Numeric inputs for price, duration, sessions
- ✅ Multi-line text area for description
- ✅ Image preview with placeholder
- ✅ Loading states during API calls
- ✅ Success/error alerts
- ✅ Translation support

**Props:**
- `visible` (boolean) - Controls modal visibility
- `onClose` (function) - Callback when modal closes
- `onPackageCreated` (function) - Callback after successful creation

**Form Fields:**
- Package Name * (required)
- Description (optional)
- Price (VND) * (required)
- Duration (days) * (required)
- Session Duration (minutes) * (required)
- Number of Sessions * (required)
- Package Image (optional)

**API Integration:**
```javascript
freelancePTPackageService.createFreelancePTPackage({
  name: string,
  description: string,
  price: number,
  durationInDays: number,
  sessionDurationInMinutes: number,
  numOfSessions: number,
  imageUrl: string
})
```

### 2. EditPackageModal.js
**Location:** `screens/FreelancePTScreen/ManagePackageScreen/EditPackageModal.js`

**Purpose:** Modal for editing and deleting existing PT packages

**Features:**
- ✅ Pre-filled form with existing package data
- ✅ Image picker with current image display
- ✅ Form validation
- ✅ Update functionality
- ✅ Delete functionality with confirmation
- ✅ Loading states
- ✅ Success/error alerts
- ✅ Translation support

**Props:**
- `visible` (boolean) - Controls modal visibility
- `onClose` (function) - Callback when modal closes
- `packageData` (object) - Current package data to edit
- `onPackageUpdated` (function) - Callback after successful update/delete

**Additional Features:**
- Delete button in header with trash icon
- Confirmation dialog before deletion
- Auto-fills form when packageData changes

**API Integration:**
```javascript
// Update
freelancePTPackageService.updateFreelancePTPackage(id, data)

// Delete
freelancePTPackageService.deleteFreelancePTPackage(id)
```

## Integration with ManagePackageScreen

### State Management
```javascript
const [showCreateModal, setShowCreateModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [selectedPackage, setSelectedPackage] = useState(null);
```

### Create Flow
1. User taps "Create New Package" button
2. `setShowCreateModal(true)` opens the modal
3. User fills the form and taps "Create"
4. API call to create package
5. On success: Alert shown, modal closes, list refreshes

### Edit Flow
1. User taps edit icon on package card
2. `handleEditPackage(id)` fetches full package details
3. `setSelectedPackage(data)` stores the data
4. `setShowEditModal(true)` opens the modal
5. Form pre-fills with existing data
6. User can update or delete
7. On success: Alert shown, modal closes, list refreshes

## Image Picker

### Dependencies
- `expo-image-picker` (already installed)

### Permissions
- Automatically requests media library permissions
- Shows alert if permission denied

### Configuration
```javascript
{
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [16, 9],
  quality: 0.8,
}
```

### Image Handling
- Selected images show preview
- Falls back to 'string' if no image selected
- Displays placeholder icon when no image

## Validation Rules

### Required Fields (*)
- Package Name: Non-empty string
- Price: Number > 0
- Duration in Days: Integer > 0
- Session Duration: Integer > 0
- Number of Sessions: Integer > 0

### Optional Fields
- Description: Any string
- Image: Any valid URI or 'string'

## UI/UX Features

### Modal Style
- Slide-up animation
- Semi-transparent overlay
- Rounded top corners (20px)
- Max height: 90% of screen

### Form Style
- Consistent input styling
- Border radius: 12px
- Placeholder text in #999
- Error validation before API call

### Button Layout
- Two-button footer
- Cancel (gray) on left
- Create/Update (red) on right
- Loading spinner during API calls

### Delete Confirmation
- Native alert dialog
- "Cancel" and "Delete" options
- Destructive style for delete button

## Translation Keys Used

From `managePackage` section:
- `createNewPackage`
- `packageName`
- `description`
- `price`
- `duration`
- `days`
- `sessionDuration`
- `minutes`
- `numberOfSessions`
- `success`
- `error`
- `packageCreated`
- `packageUpdated`
- `packageDeleted`
- `failedToCreate`
- `failedToUpdate`
- `failedToDelete`

## Error Handling

### Form Validation Errors
- Shows Alert with specific field error
- Prevents API call if validation fails

### API Errors
- Catches and logs errors to console
- Shows user-friendly error Alert
- Returns loading state to normal

### Permission Errors
- Shows Alert if gallery permission denied
- Gracefully handles permission request failure

## Testing Checklist

- [ ] Create new package with all fields
- [ ] Create package without image
- [ ] Create package with invalid data
- [ ] Edit existing package
- [ ] Update package image
- [ ] Delete package with confirmation
- [ ] Cancel delete operation
- [ ] Close modal without saving
- [ ] Test with no gallery permission
- [ ] Test with network error
- [ ] Verify list refresh after create
- [ ] Verify list refresh after update
- [ ] Verify list refresh after delete

## Future Enhancements

### Possible Improvements
- [ ] Image upload to server (currently uses local URI)
- [ ] Multiple image selection
- [ ] Drag-and-drop image reordering
- [ ] Rich text editor for description
- [ ] Package duplication feature
- [ ] Bulk delete functionality
- [ ] Package templates
- [ ] Price history tracking
- [ ] Package analytics

### Advanced Features
- [ ] Camera integration for direct photo capture
- [ ] Image cropping/editing tools
- [ ] Auto-save draft functionality
- [ ] Undo/redo for edits
- [ ] Package comparison view

## Notes

### Image URL Handling
- Currently accepts any string as imageUrl
- Backend expects 'string' as default/placeholder
- Real image URLs should be uploaded to server
- Local URIs from ImagePicker are temporary

### Performance
- Modals use `animationType="slide"` for smooth transitions
- ScrollView for long forms prevents keyboard overlap
- Form state resets on close to prevent stale data

### Accessibility
- All buttons have proper touch targets
- Placeholder text provides guidance
- Error messages are clear and actionable
- Loading states prevent duplicate submissions
