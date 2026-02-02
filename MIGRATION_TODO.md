# Firebase to Supabase Migration - In Progress

## ✅ Completed
- [x] Supabase project setup
- [x] Database schema created
- [x] Row Level Security (RLS) policies configured
- [x] AuthContext migrated to Supabase Auth
- [x] Supabase client installed

## 🚧 In Progress
Migrating screens from Firestore to Supabase PostgreSQL:

### Key Changes Needed:
1. Replace `collection()`, `doc()`, `query()` with Supabase `.from()` queries
2. Replace `onSnapshot()` real-time listeners with Supabase `.on()` subscriptions
3. Replace `addDoc()`, `setDoc()`, `updateDoc()`, `deleteDoc()` with `.insert()`, `.update()`, `.delete()`
4. Update user ID references from `currentUser.uid` to `appUser.id`
5. Remove Cloudinary signed uploads (Cloud Functions) - will use MinIO later

### Screens to Migrate:
- [ ] HomeScreen.js - Main feed, posts listing, likes, delete
- [ ] PostScreen.js - Create new post
- [ ] PostDetailsScreen.js - View post with replies
- [ ] ProfileScreen.js - User profile, stats, profile picture upload
- [ ] SettingsScreen.js - Update profile, emoji, bio
- [ ] NotificationScreen.js - Notifications listing
- [ ] UserPostsScreen.js - User's posts listing
- [ ] ViewUserProfileScreen.js - View another user's profile

## Database Schema Mapping:

### Firestore → Supabase
```
posts (collection) → posts (table)
  - id → id (UUID)
  - userId → user_id (UUID, FK to users)
  - text → text
  - category → category
  - createdAt → created_at
  - likesCount → likes_count (auto-updated by trigger)
  - replies/count → replies_count (auto-updated by trigger)
  
likes (subcollection) → likes (table)
  - Composite key: (post_id, user_id)
  
replies (subcollection) → replies (table)
  - id → id (UUID)
  - post_id → post_id (FK)
  - user_id → user_id (FK)
  - text → text
  - created_at → created_at
  
users (collection) → users (table)
  - uid → id (UUID, auto-generated)
  - auth_id (new field, links to Supabase auth.users)
  - username → username
  - emoji → emoji  
  - profilePic → profile_pic
  - bio → bio
  - expoPushToken → expo_push_token
  
notifications (collection) → notifications (table)
  - recipient_id, sender_id, post_id, type, read, created_at
```

## Testing Checklist:
After migration, test:
- [ ] User registration
- [ ] User login/logout
- [ ] Create post
- [ ] Like/unlike posts
- [ ] Reply to posts
- [ ] Delete own posts
- [ ] Delete own replies
- [ ] View user profiles
- [ ] View notifications
- [ ] Update profile (emoji, bio)
- [ ] Profile picture upload (temporary: direct upload without signature)
