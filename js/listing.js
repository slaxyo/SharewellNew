import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient('https://nsjzjxntfeybinntxxrw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U')

const { data: { session } } = await supabase.auth.getSession()
if (!session) window.location.href = '/ghod/login.html'

const user = session.user

document.getElementById('listingForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const title = document.getElementById('title').value
  const imageUrl = document.getElementById('imageUrl').value
  const description = document.getElementById('description').value
  const price = parseFloat(document.getElementById('price').value)

  const { error } = await supabase.from('listings').insert([
    {
      user_id: user.id,
      title,
      image_url: imageUrl,
      description,
      price
    }
  ])

  if (error) {
    showToast('Failed to create listing.')
    console.error(error)
  } else {
    showToast('✅ Listing created successfully!')
    document.getElementById('listingForm').reset()
  }
})

function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.className = 'toast show'
  setTimeout(() => {
    toast.className = 'toast'
  }, 3000)
}
