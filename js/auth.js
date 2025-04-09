const { createClient } = supabase
const supabaseUrl = 'https://nsjzjxntfeybinntxxrw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
const supabaseClient = createClient(supabaseUrl, supabaseKey)

const form = document.querySelector('form')

form?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const fullName = form.querySelector('input[name="full_name"]').value
  const username = form.querySelector('input[name="username"]').value
  const email = form.querySelector('input[name="email"]').value
  const password = form.querySelector('input[name="password"]').value

  const { data, error } = await supabaseClient.auth.signUp({ email, password })

  if (error) {
    alert('Signup failed: ' + error.message)
    return
  }

  const userId = data.user.id

  const { error: profileError } = await supabaseClient
    .from('profiles')
    .insert([{ id: userId, full_name: fullName, username }])

  if (profileError) {
    alert('Account created but failed to save profile info.')
    console.error(profileError)
  } else {
    alert('Success! Account created.')
    window.location.href = '/profile/dashboard.html'
  }
})
