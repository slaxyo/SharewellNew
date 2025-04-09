import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  window.location.href = '/ghod/login.html'
}

// Handle opening modal
document.getElementById('change-email').addEventListener('click', () => {
    document.getElementById('emailModal').style.display = 'flex'
  })  


// Handle closing modal
document.querySelector('.close-email').addEventListener('click', () => {
  document.getElementById('emailModal').style.display = 'none'
})
window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('emailModal')) {
    document.getElementById('emailModal').style.display = 'none'
  }
})

// Submit new email
document.getElementById('changeEmailForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const inputEl = document.querySelector('#emailModal #newEmail')
  if (!inputEl) return showToast('Email field not found.')
  
  const newEmail = inputEl.value
  
  const { error } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (error) {
    showToast(`Failed to update email: ${error.message}`)
  } else {
    showToast('Email updated. Please confirm via your inbox.')
    document.getElementById('emailModal').style.display = 'none'
  }
})
function showToast(message) {
    const toast = document.createElement('div')
    toast.className = 'toast'
  
    const text = document.createElement('span')
    text.textContent = message
  
    const progress = document.createElement('div')
    progress.className = 'toast-progress'
  
    toast.appendChild(text)
    toast.appendChild(progress)
    document.body.appendChild(toast)
  
    // Trigger toast appearance
    requestAnimationFrame(() => {
      toast.classList.add('show')
      progress.classList.add('animate')
    })
  
    // Fade out after 3s
    setTimeout(() => {
      toast.classList.remove('show')
      toast.classList.add('hide')
      setTimeout(() => toast.remove(), 300) // wait for fade-out
    }, 3000)
  }
  
// Close modal
document.querySelector('.close-email').addEventListener('click', () => {
    document.getElementById('emailModal').style.display = 'none'
  })
  
  // Optionally close on outside click
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('emailModal')
    if (e.target === modal) {
      modal.style.display = 'none'
    }
  })
  // Close all modals
function closeModal(id) {
    document.getElementById(id).style.display = 'none'
  }
  
  // Add close handlers
  document.querySelectorAll('.modal .close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal')
      if (modal) modal.style.display = 'none'
    })
  })
  
  // Close on outside click
  window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal')
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none'
      }
    })
  })
  