import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Supabase Client
const supabase = createClient(
  'https://nsjzjxntfeybinntxxrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zanpqeG50ZmV5YmlubnR4eHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzU3ODQsImV4cCI6MjA1OTcxMTc4NH0.wwaHBJVMSXcH1biXKbqhW4ZpWKj_Px4rOzStSddFm1U'
)

// 2. Constants & Checking for userId
const DEFAULT_AVATAR = '../default-avatar.png'
const DEFAULT_BANNER = 'https://placehold.co/1200x240?text=Banner'

const userId = new URLSearchParams(window.location.search).get('id')

if (!userId) {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    window.location.href = '/login.html'
  } else {
    window.location.href = `/profile/profile.html?id=${data.user.id}`
  }
}

// 3. DOM Elements
const avatarEl = document.getElementById('avatar')
const bannerEl = document.getElementById('banner-image')
const nameEl = document.getElementById('display-name')
const usernameEl = document.getElementById('username')
const bioEl = document.getElementById('bio')
bioEl.style.textAlign = 'left'

// Gift Edit Modal
const giftModal = document.getElementById('gift-edit-modal')
const saveBtn = document.getElementById('save-edit')
const cancelBtn = document.getElementById('cancel-edit')
const closeBtn = document.getElementById('close-edit-modal')
const wishlist = document.getElementById('wishlist')

// 4. Fetch profile data
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('username, full_name, avatar_url, banner_url, bio')
  .eq('id', userId)
  .single()

// 5. Display profile or fallback
if (profileError || !profile) {
  nameEl.textContent = 'User not found'
  usernameEl.textContent = '@username'
  bioEl.innerHTML = 'Loading bio...'
  avatarEl.src = DEFAULT_AVATAR
  bannerEl.src = DEFAULT_BANNER
} else {
  nameEl.textContent = profile.full_name || 'Unnamed'
  usernameEl.textContent = '@' + profile.username
  bioEl.innerHTML = (profile.bio || '').replace(/\n/g, '<br>')
  avatarEl.src = profile.avatar_url || DEFAULT_AVATAR
  bannerEl.src = profile.banner_url || DEFAULT_BANNER
}

// 6. Fetch listings for this user
const { data: listings } = await supabase
  .from('listings')
  .select('id, title, image_url, price')
  .eq('user_id', userId)

  // Insert the count next to “Wishlist”
const wishlistCount = listings?.length || 0
const wishlistTab = document.getElementById('wishlist-tab')
if (wishlistTab) {
  wishlistTab.innerHTML = `
    Wishlist
    <span class="feed-badge">${wishlistCount}</span>
  `
}


// 7. Render listings, add edit logic
listings?.forEach(item => {
  const card = document.createElement('div')
  card.className = 'card'
  card.innerHTML = `
    <img src="${item.image_url}" alt="${item.title}" />
    <div class="content">
      <h2>${item.title}</h2>
      <p>Vendor Name</p>
      <p>$${item.price}</p>
      <span class="fees-badge">0% Fees</span>
    </div>
    <div class="card-actions">
      <button class="icon-btn edit-btn" style="position: static;">
        <i class="fas fa-pencil-alt"></i>
      </button>
      <button class="icon-btn"><i class="fas fa-trash"></i></button>
      <div class="dropdown-wrapper">
        <button class="icon-btn more-btn"><i class="fas fa-ellipsis-h"></i></button>
        <div class="dropdown-options">
          <div class="dropdown-item">Save gift for later</div>
          <div class="dropdown-item">Change gift position</div>
          <div class="dropdown-item">View Product Details</div>
        </div>
      </div>
    </div>
    <button class="add-to-cart">Add to cart</button>
  `
  wishlist.appendChild(card)

  // Setup editing
  const editBtn = card.querySelector('.edit-btn')
  const title = card.querySelector('h2')
  const vendor = card.querySelectorAll('p')[0]
  const price = card.querySelectorAll('p')[1]

  editBtn.addEventListener('click', () => {
    // Pre-fill edit modal
    document.getElementById('edit-title').value = title.textContent
    document.getElementById('edit-vendor').value = vendor.textContent
    document.getElementById('edit-price').value = price.textContent

    // Reset image path
    editedImagePath = null
    editDropzone.innerHTML = `
      <p>Drag & drop or click to upload</p>
      <input type="file" id="edit-image-file" accept="image/*" hidden />
    `
    editBtn.addEventListener('click', () => {
      giftModal.style.display = 'flex'
    })

    saveBtn.onclick = async () => {
      const newTitle = document.getElementById('edit-title').value
      const newVendor = document.getElementById('edit-vendor').value
      const newPrice = document.getElementById('edit-price').value

      const updates = {
        title: newTitle,
        price: parseFloat(newPrice)
        // If you want vendor saved in DB, add "vendor: newVendor" here
      }

      // Only update the image if changed
      if (editedImagePath) {
        updates.image_url = editedImagePath
      }

      const { error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', item.id)

      if (error) {
        alert('Failed to save changes')
        console.error(error)
        return
      }

      // Reflect changes in UI
      title.textContent = newTitle
      vendor.textContent = newVendor
      price.textContent = `$${newPrice}`
      if (editedImagePath) {
        card.querySelector('img').src = `${editedImagePath}?t=${Date.now()}`
      }

      editedImagePath = null
      giftModal.style.display = 'none'
    }
  })

  // Setup image editing / drag-drop
  const editDropzone = document.getElementById('edit-dropzone')
  const editFileInput = document.getElementById('edit-image-file')
  let editedImagePath = null

  editDropzone.addEventListener('click', () => editFileInput.click())

  editDropzone.addEventListener('dragover', (e) => {
    e.preventDefault()
    editDropzone.classList.add('dragover')
  })

  editDropzone.addEventListener('dragleave', () => {
    editDropzone.classList.remove('dragover')
  })

  editDropzone.addEventListener('drop', async (e) => {
    e.preventDefault()
    editDropzone.classList.remove('dragover')
    const file = e.dataTransfer.files[0]
    if (file) await handleEditImageUpload(file)
  })

  editFileInput.addEventListener('change', async () => {
    const file = editFileInput.files[0]
    if (file) await handleEditImageUpload(file)
  })

  async function handleEditImageUpload(file) {
    const toast = createToast()

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.')
      return
    }

    editDropzone.innerHTML = `
      <p style="color: #666;">Uploading...</p>
      <div class="spinner"></div>
    `

    const ext = file.name.split('.').pop()
    const path = `${userId}/gift-edit-${Date.now()}.${ext}`
    const { error } = await supabase
      .storage
      .from('gift-images')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage
        .from('gift-images')
        .getPublicUrl(path)
      editedImagePath = data.publicUrl

      editDropzone.innerHTML = `
        <img
          src="${editedImagePath}"
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"
        />
      `
      toast.success('✅ Successfully uploaded gift image.')
    } else {
      editDropzone.innerHTML = `<p>Drag & drop or click to upload</p>`
      toast.error('Image upload failed. Try again.')
      console.error(error)
    }
  }
})

// 8. Profile (Avatar/Banner) modal logic
const modal = document.getElementById('edit-modal')
const closeModalBtn = document.getElementById('close-modal')
const profileSaveBtn = document.getElementById('save-changes')

document.getElementById('change-avatar').addEventListener('click', () => {
  // Prefill the bio text area with the existing bio
  document.getElementById('modal-bio').value = profile?.bio || ''

  modal.style.display = 'flex'
  requestAnimationFrame(() => {
    modal.classList.add('visible')
  })
})


closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('visible')
  modal.style.display = 'none'
})

document.getElementById('close-modal-btn')?.addEventListener('click', () => {
  modal.classList.remove('visible')
  modal.style.display = 'none'
})

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('visible')
    modal.style.display = 'none'
  }
})

profileSaveBtn.addEventListener('click', async () => {
  const avatarFile = document.getElementById('modal-avatar-upload').files[0]
  const bannerFile = document.getElementById('modal-banner-upload').files[0]
  const bioValue = document.getElementById('modal-bio').value

  // Upload new avatar
  if (avatarFile) {
    const ext = avatarFile.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase
      .storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })
    if (!error) {
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(path)
      await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId)
      avatarEl.src = `${data.publicUrl}?t=${Date.now()}`
    }
  }

  // Upload new banner
  if (bannerFile) {
    const ext = bannerFile.name.split('.').pop()
    const path = `${userId}/banner.${ext}`
    const { error } = await supabase
      .storage
      .from('banners')
      .upload(path, bannerFile, { upsert: true })
    if (!error) {
      const { data } = supabase
        .storage
        .from('banners')
        .getPublicUrl(path)
      await supabase
        .from('profiles')
        .update({ banner_url: data.publicUrl })
        .eq('id', userId)
      bannerEl.src = `${data.publicUrl}?t=${Date.now()}`
    }
  }

  // Update bio
  if (bioValue !== undefined) {
    await supabase
      .from('profiles')
      .update({ bio: bioValue })
      .eq('id', userId)
    bioEl.innerHTML = bioValue.replace(/\n/g, '<br>')
  }

  modal.classList.remove('visible')
  modal.style.display = 'none'
})

// 9. Navbar avatar logic
async function loadNavbarAvatar() {
  const { data: { session } } = await supabase.auth.getSession()
  const avatar = document.getElementById('nav-avatar')
  if (!avatar) return

  if (session?.user?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', session.user.id)
      .single()
    avatar.src = profile?.avatar_url || DEFAULT_AVATAR
  } else {
    avatar.src = DEFAULT_AVATAR
  }
}
loadNavbarAvatar()

// 10. Profile Dropdown Toggle
const avatarIcon = document.getElementById('nav-avatar')
const dropdown = document.getElementById('profile-dropdown')

avatarIcon?.addEventListener('click', () => {
  dropdown.style.display =
    dropdown.style.display === 'flex' ? 'none' : 'flex'
})

window.addEventListener('click', (e) => {
  if (!avatarIcon.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none'
  }
})

// 11. Add Gift Modal Logic
const addGiftModal = document.getElementById('add-gift-modal')
const openAddGiftBtn = document.querySelector('.add-gift')
const closeAddGiftBtn = document.getElementById('close-add-gift')
const cancelAddGiftBtn = document.getElementById('cancel-add-gift')
const addGiftForm = document.getElementById('add-gift-form')

openAddGiftBtn.addEventListener('click', () => {
  addGiftModal.style.display = 'flex'
})

closeAddGiftBtn.addEventListener('click', () => {
  addGiftModal.style.display = 'none'
})

cancelAddGiftBtn.addEventListener('click', () => {
  addGiftModal.style.display = 'none'
})

window.addEventListener('click', (e) => {
  if (e.target === addGiftModal) {
    addGiftModal.style.display = 'none'
  }
})

// 12. Gift Upload Logic
const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('gift-image-file')
let uploadedImagePath = null

dropzone.addEventListener('click', () => fileInput.click())

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('dragover')
})

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover')
})

dropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  dropzone.classList.remove('dragover')
  const file = e.dataTransfer.files[0]
  if (file) await handleImageUpload(file)
})

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0]
  if (file) await handleImageUpload(file)
})

async function handleImageUpload(file) {
  const toast = createToast()

  if (!file.type.startsWith('image/')) {
    toast.error('Only image files are allowed.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be under 5MB.')
    return
  }

  dropzone.innerHTML = `
    <p style="color: #666;">Uploading...</p>
    <div class="spinner"></div>
  `

  const ext = file.name.split('.').pop()
  const path = `${userId}/gift-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('gift-images')
    .upload(path, file, { upsert: true })

  if (!error) {
    const { data } = supabase.storage
      .from('gift-images')
      .getPublicUrl(path)
    uploadedImagePath = data.publicUrl

    dropzone.innerHTML = `
      <img
        src="${uploadedImagePath}"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"
      />
    `
    toast.success('✅ Successfully uploaded gift image.')
  } else {
    dropzone.innerHTML = `<p>Drag & drop or click to upload</p>`
    toast.error('Image upload failed. Try again.')
    console.error(error)
  }
}

// 13. Create Toast
function createToast() {
  let el = document.getElementById('upload-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'upload-toast'
    document.body.appendChild(el) // Must happen before styling

    el.style.position = 'fixed'
    el.style.bottom = '20px'
    el.style.right = '20px'
    el.style.padding = '12px 16px'
    el.style.background = '#111'
    el.style.color = '#fff'
    el.style.borderRadius = '10px'
    el.style.fontSize = '14px'
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s ease'
    el.style.zIndex = '99999'
    el.style.backdropFilter = 'none'
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
  }

  function show(msg, color) {
    el.textContent = msg
    el.style.background = color
    el.style.opacity = '1'
    setTimeout(() => {
      el.style.opacity = '0'
    }, 3000)
  }

  return {
    success: (msg) => show(msg, '#1a7f37'),
    error: (msg) => show(msg, '#d62828')
  }
}

// 14. Submit "Add Gift" Form
addGiftForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const title = document.getElementById('gift-title').value
  const image_url = uploadedImagePath

  if (!image_url) {
    alert('Please upload an image first.')
    return
  }

  const description = document.getElementById('gift-description').value
  const price = parseFloat(document.getElementById('gift-price').value)

  // Grab session user
  const { data: { session } } = await supabase.auth.getSession()
  const user = session.user

  // Insert listing
  const { error } = await supabase.from('listings').insert([
    {
      user_id: user.id,
      title,
      image_url,
      description,
      price
    }
  ])

  if (error) {
    alert('Failed to add gift.')
    console.error(error)
  } else {
    addGiftModal.style.display = 'none'
    addGiftForm.reset()
    location.reload()
  }
})
// Make the 'X' button close the gift modal
closeBtn.addEventListener('click', () => {
  giftModal.style.display = 'none'
})

// Make the 'Cancel' button close the gift modal
cancelBtn.addEventListener('click', () => {
  giftModal.style.display = 'none'
})

// Optional: close modal if user clicks outside the modal content
window.addEventListener('click', (e) => {
  if (e.target === giftModal) {
    giftModal.style.display = 'none'
  }
})
let avatarImagePath = null
let bannerImagePath = null

// 1. Avatar dropzone
const avatarDropzone = document.getElementById('avatar-dropzone')
const avatarFileInput = document.getElementById('modal-avatar-upload')

avatarDropzone.addEventListener('click', () => avatarFileInput.click())

avatarDropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  avatarDropzone.classList.add('dragover')
})

avatarDropzone.addEventListener('dragleave', () => {
  avatarDropzone.classList.remove('dragover')
})

avatarDropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  avatarDropzone.classList.remove('dragover')
  const file = e.dataTransfer.files[0]
  if (file) await handleAvatarUpload(file)
})

avatarFileInput.addEventListener('change', async () => {
  const file = avatarFileInput.files[0]
  if (file) await handleAvatarUpload(file)
})

async function handleAvatarUpload(file) {
  const toast = createToast()

  if (!file.type.startsWith('image/')) {
    toast.error('Only image files are allowed.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be under 5MB.')
    return
  }

  avatarDropzone.innerHTML = `<p style="color: #666;">Uploading...</p><div class="spinner"></div>`

  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar-edit-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })

  if (!error) {
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    avatarImagePath = data.publicUrl

    avatarDropzone.innerHTML = `
      <img
        src="${avatarImagePath}"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"
      />
    `
    toast.success('✅ Successfully uploaded new avatar.')
  } else {
    avatarDropzone.innerHTML = `<p>Drag & drop or click to upload</p>`
    toast.error('Image upload failed. Try again.')
    console.error(error)
  }
}

// 2. Banner dropzone
const bannerDropzone = document.getElementById('banner-dropzone')
const bannerFileInput = document.getElementById('modal-banner-upload')

bannerDropzone.addEventListener('click', () => bannerFileInput.click())

bannerDropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  bannerDropzone.classList.add('dragover')
})

bannerDropzone.addEventListener('dragleave', () => {
  bannerDropzone.classList.remove('dragover')
})

bannerDropzone.addEventListener('drop', async (e) => {
  e.preventDefault()
  bannerDropzone.classList.remove('dragover')
  const file = e.dataTransfer.files[0]
  if (file) await handleBannerUpload(file)
})

bannerFileInput.addEventListener('change', async () => {
  const file = bannerFileInput.files[0]
  if (file) await handleBannerUpload(file)
})

async function handleBannerUpload(file) {
  const toast = createToast()

  if (!file.type.startsWith('image/')) {
    toast.error('Only image files are allowed.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be under 5MB.')
    return
  }

  bannerDropzone.innerHTML = `<p style="color: #666;">Uploading...</p><div class="spinner"></div>`

  const ext = file.name.split('.').pop()
  const path = `${userId}/banner-edit-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true })

  if (!error) {
    const { data } = supabase.storage.from('banners').getPublicUrl(path)
    bannerImagePath = data.publicUrl

    bannerDropzone.innerHTML = `
      <img
        src="${bannerImagePath}"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"
      />
    `
    toast.success('✅ Successfully uploaded new banner.')
  } else {
    bannerDropzone.innerHTML = `<p>Drag & drop or click to upload</p>`
    toast.error('Image upload failed. Try again.')
    console.error(error)
  }
}
profileSaveBtn.addEventListener('click', async () => {
  // 1. If user dragged/dropped a new avatar:
  if (avatarImagePath) {
    await supabase
      .from('profiles')
      .update({ avatar_url: avatarImagePath })
      .eq('id', userId)

    avatarEl.src = `${avatarImagePath}?t=${Date.now()}`
  }

  // 2. If user dragged/dropped a new banner:
  if (bannerImagePath) {
    await supabase
      .from('profiles')
      .update({ banner_url: bannerImagePath })
      .eq('id', userId)

    bannerEl.src = `${bannerImagePath}?t=${Date.now()}`
  }

  // 3. Save updated bio
  const bioValue = document.getElementById('modal-bio').value
  if (bioValue !== undefined) {
    await supabase
      .from('profiles')
      .update({ bio: bioValue })
      .eq('id', userId)
    bioEl.innerHTML = bioValue.replace(/\n/g, '<br>')
  }

  // 4. Close modal
  modal.classList.remove('visible')
  modal.style.display = 'none'
})
document.getElementById('logout-Btn')?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '/login.html'
})