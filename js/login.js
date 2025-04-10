// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

const form = document.querySelector('form')
form?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = form.querySelector('input[type="email"]').value
  const password = form.querySelector('input[type="password"]').value

  // Log in with password
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    alert('Login failed: ' + error.message)
    console.error(error)
  } else {
    // data.user contains the user ID directly
    if (data?.user?.id) {
      // Pass the user ID to the profile page
      window.location.href = `/profile/profile.html?id=${data.user.id}`
    } else {
      alert('Something went wrong. Try again.')
      console.error('No user ID returned from login', data)
    }
  }
})
