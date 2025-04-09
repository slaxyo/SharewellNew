import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient('https://nsjzjxntfeybinntxxrw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U')

const { data: { session } } = await supabase.auth.getSession()
if (!session) window.location.href = '/ghod/login.html'

const user = session.user

const { data: listings, error } = await supabase
  .from('listings')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

if (error) {
  console.error('Error fetching listings:', error)
} else {
  const container = document.getElementById('activity-container')
  if (listings.length === 0) {
    container.innerHTML = '<p>No listings yet.</p>'
  } else {
    listings.forEach(listing => {
      const card = document.createElement('div')
      card.className = 'activity-card'
      card.innerHTML = `
        <img src="${listing.image_url}" alt="${listing.title}" />
        <h4>${listing.title}</h4>
        <p>${listing.description}</p>
        <span>$${listing.price}</span>
      `
      container.appendChild(card)
    })
  }
}
