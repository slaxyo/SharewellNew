import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

// Get ID from URL
const params = new URLSearchParams(window.location.search)
const id = params.get('id')
if (!id) {
  document.body.innerHTML = '<h1>Invalid item ID</h1>'
  throw new Error('Missing ID in URL')
}

// Fetch listing
const { data: listingData, error } = await supabase
  .from('listings')
  .select('*, profiles(full_name, username)')
  .eq('id', id)
  .single()

const wrapper = document.getElementById('product-wrapper')

if (error || !listingData) {
  wrapper.innerHTML = '<h1>Item could not be loaded</h1>'
} else {
  wrapper.innerHTML = `
    <div class="product-container">
      <img src="${listingData.image_url}" alt="${listingData.title}" />
      <div class="product-info">
        <h1>${listingData.title}</h1>
        <p class="price">$${listingData.price}</p>
        <p class="description">${listingData.description}</p>
        <p class="owner">Requested by <strong>${listingData.profiles?.username || 'Unknown'}</strong></p>
        <p class="date">Posted on ${new Date(listingData.created_at).toLocaleDateString()}</p>
        <button id="buyBtn">Buy this Item</button>
      </div>
    </div>
  `

  // Buy button handler
  document.getElementById('buyBtn')?.addEventListener('click', () => {
    const confirmBuy = confirm(`Are you sure you want to buy this for ${listingData.profiles?.username || 'the user'}?`)
    if (confirmBuy) {
      showToast('Thanks! You’ve committed to fulfilling this request.')
    }
  })
}

// Toast function
function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'toast show'
  toast.innerHTML = `
    ${message}
    <div class="toast-progress animate"></div>
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
