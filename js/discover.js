import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('discover-grid')

  // Load listings from Supabase
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, image_url, price')

  if (error) {
    console.error('Failed to load listings', error)
  } else {
    listings.forEach(listing => {
      const card = document.createElement('a')
      card.className = 'card'
      card.href = `product.html?id=${listing.id}`
      card.innerHTML = `
        <img src="${listing.image_url}" alt="${listing.title}" />
        <div class="content">
          <h2>${listing.title}</h2>
          <p>$${listing.price}</p>
        </div>
      `
      container.appendChild(card)
    })
  }

  // Auth UI toggle
  const { data: { session } } = await supabase.auth.getSession()
  const loginBtn = document.getElementById('login-button')
  const profileBtn = document.getElementById('profile-button')

  if (session) {
    if (loginBtn) loginBtn.style.display = 'none'
    if (profileBtn) profileBtn.style.display = 'inline-block'
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block'
    if (profileBtn) profileBtn.style.display = 'none'
  }

  // Header animation + glider tab logic
  const header = document.getElementById('main-header')
  const tabsWrapper = document.getElementById('floating-tabs')
  const tabs = document.querySelectorAll('.tab')
  const glider = document.querySelector('.glider')
  const featureCards = document.getElementById('featureCards')
  let lastScroll = 0

  function updateGliderPosition(activeTab) {
    const tabRect = activeTab.getBoundingClientRect()
    const wrapperRect = activeTab.parentElement.getBoundingClientRect()
    const offset = tabRect.left - wrapperRect.left
    glider.style.width = `${tabRect.width}px`
    glider.style.transform = `translateX(${offset}px)`
  }

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset

    if (currentScroll > lastScroll && currentScroll > 250) {
      header.classList.add('hide')
    } else if (lastScroll - currentScroll > 250 || currentScroll < 250) {
      header.classList.remove('hide')
    }

    if (currentScroll > 250) {
      header.classList.add('scrolled')
    } else {
      header.classList.remove('scrolled')
      const activeTab = document.querySelector('.tab.active')
      if (activeTab) updateGliderPosition(activeTab)
    }

    lastScroll = currentScroll

    const activeTab = document.querySelector('.tab.active')
    if (activeTab) updateGliderPosition(activeTab)
  })

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      updateGliderPosition(tab)

      const target = tab.dataset.target
      if (target?.startsWith('#')) {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = target
      }
    })
  })

  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.tab.active')
    if (activeTab) updateGliderPosition(activeTab)
  })
  const discoverTab = [...tabs].find(tab => tab.textContent.trim() === 'Discover')
  if (discoverTab) {
    discoverTab.classList.add('active')
    updateGliderPosition(discoverTab)
  }
  
  window.addEventListener('load', () => {
    featureCards.scrollLeft = 60
    const initialActive = document.querySelector('.tab.active') || tabs[0]
    if (initialActive) {
      initialActive.classList.add('active')
      updateGliderPosition(initialActive)
    }
  })
})
window.addEventListener('load', () => {
    const discoverTab = document.querySelector('label[for="tab-discover"]')
    if (discoverTab) {
      discoverTab.classList.add('active')
      updateGliderPosition(discoverTab)
    }
  })
  