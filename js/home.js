
document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('main-header')
  const menuToggle = document.getElementById('menu-toggle')
  const mobileNav = document.getElementById('mobile-nav')
  const closeBtn = document.getElementById('close-btn')
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

  // Handle scroll behavior
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

  // Tab navigation + glider + smooth scroll
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      updateGliderPosition(tab)

      const target = tab.dataset.target
      const input = document.getElementById(`tab-${tab.textContent.toLowerCase()}`)
      if (input) input.checked = true
      if (target) document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    })
  })

  // Recalculate glider on window resize
  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.tab.active')
    if (activeTab) updateGliderPosition(activeTab)
  })

  // Feature cards scroll buttons
  document.querySelector('.scroll-btn.left')?.addEventListener('click', () => {
    featureCards.scrollBy({ left: -300, behavior: 'smooth' })
  })

  document.querySelector('.scroll-btn.right')?.addEventListener('click', () => {
    featureCards.scrollBy({ left: 300, behavior: 'smooth' })
  })

  window.addEventListener('load', () => {
    featureCards.scrollLeft = 60
    const initialActive = document.querySelector('.tab.active') || tabs[0]
    if (initialActive) {
      initialActive.classList.add('active')
      updateGliderPosition(initialActive)
    }
  })

  // Optional: mobile nav toggle
  if (menuToggle && mobileNav && closeBtn) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.add('open')
    })

    closeBtn.addEventListener('click', () => {
      mobileNav.classList.remove('open')
    })
  }
})
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

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