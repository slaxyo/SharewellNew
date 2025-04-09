import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

const { data: { session } } = await supabase.auth.getSession()
if (!session) window.location.href = '/ghod/login.html'

const user = session.user

// Profile from Supabase
const { data: profile, error } = await supabase
  .from('profiles')
  .select('full_name, username')
  .eq('id', user.id)
  .single()

if (error) {
  document.getElementById('name').textContent = 'User'
  document.getElementById('username').textContent = 'Unavailable'
} else {
  document.getElementById('name').textContent = profile.full_name || 'User'
  document.getElementById('username').textContent = profile.username || 'N/A'
  const editNameInput = document.getElementById('editName')
  const editUsernameInput = document.getElementById('editUsername')
  
  if (editNameInput) editNameInput.value = profile.full_name
  if (editUsernameInput) editUsernameInput.value = profile.username  
}

// Email + Date
function censorEmail(email) {
  const [name, domain] = email.split('@')
  const censoredName =
    name.length > 4
      ? name.slice(0, 3) + '*'.repeat(name.length - 4) + name.slice(-1)
      : name[0] + '*'.repeat(name.length - 2) + name.slice(-1)

  const domainName = domain.split('.')[0]
  const censoredDomain =
    domainName.length > 2
      ? domainName[0] + '*'.repeat(domainName.length - 2) + domainName.slice(-1)
      : domainName

  const domainRest = domain.split('.').slice(1).join('.')
  return `${censoredName}@${censoredDomain}.${domainRest}`
}

if (user && user.email && user.created_at) {
  const email = user.email
  const creationDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  document.getElementById('user-email').textContent = censorEmail(email)
  document.getElementById('user-date').textContent = creationDate
}

// Log out
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '/ghod/login.html'
})

// Edit profile modal
const modal = document.getElementById('profileModal')
const closeModal = document.getElementById('closeModal')

document.getElementById('edit-profile')?.addEventListener('click', () => {
  modal.style.display = 'flex'
})

closeModal?.addEventListener('click', () => {
  modal.style.display = 'none'
})

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none'
})

// Save profile changes
document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const full_name = document.getElementById('editName').value
  const username = document.getElementById('editUsername').value

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ full_name, username })
    .eq('id', user.id)

  if (updateError) {
    alert('Failed to update profile')
  } else {
    alert('Profile updated successfully!')
    document.getElementById('name').textContent = full_name
    document.getElementById('username').textContent = username
    modal.style.display = 'none'
  }
})
function timeAgo(dateString) {
  const created = new Date(dateString)
  const now = new Date()
  const diff = (now - created) / 1000

  if (diff < 60) return `${Math.floor(diff)} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`
  return `${Math.floor(diff / 31536000)} years ago`
}

const activityList = document.getElementById('recent-activity')

const { data: listings } = await supabase
  .from('listings')
  .select('title, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(5)

if (listings && listings.length > 0) {
  listings.forEach(listing => {
    const entry = document.createElement('p')
    entry.textContent = `${listing.title} – ${timeAgo(listing.created_at)}`
    activityList.appendChild(entry)
  })
} else {
  activityList.innerHTML = '<p>No recent activity.</p>'
}
