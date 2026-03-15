function openMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar) sidebar.classList.add("active");
  if (overlay) overlay.classList.add("active");
}

function closeMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (sidebar) sidebar.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}

async function logout() {
  if (window.supabase) {
    await window.supabase.auth.signOut();
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Inject Menu HTML if the container exists
  const menuContainer = document.getElementById("menu-container");
  
  if (menuContainer) {
    try {
      const response = await fetch("components/menu.html");
      const html = await response.text();
      menuContainer.innerHTML = html;

      // 1. Highlight Active Link
      const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
      const navLinks = document.querySelectorAll("#navMenu a");
      
      navLinks.forEach(link => {
        const linkPage = link.getAttribute("href");
        if (linkPage === currentPage) {
          link.parentElement.classList.add("active");
        }
      });

    } catch (err) {
      console.error("Failed to load menu component", err);
    }
  }

  // Fetch User Data for Menu if Supabase is available
  if (window.supabase) {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (user && !error) {
      const metadata = user.user_metadata || {};
      const firstName = metadata.first_name || "User";
      
      // Wait a tiny bit for the menu to be injected into the DOM
      setTimeout(() => {
        const sidebarNameElem = document.getElementById("sidebarName");
        if (sidebarNameElem) {
          sidebarNameElem.innerText = firstName;
        }
        
        // Also update avatar initials
        const avatarElem = document.querySelector(".avatar");
        if (avatarElem && firstName) {
          avatarElem.innerText = firstName.substring(0, 2).toUpperCase();
        }
      }, 100);
    }
  }
});

// GLOBAL SUCCESS MODAL INJECTOR
window.showSuccessPopup = function(title, message, callback) {
  let overlay = document.getElementById("globalSuccessOverlay");
  
  // Create it on the fly if it doesn't exist
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "globalSuccessOverlay";
    overlay.className = "success-overlay";
    overlay.innerHTML = `
      <div class="success-modal">
        <div class="success-icon">✓</div>
        <h3 id="successTitle">Success!</h3>
        <p id="successMessage">Action completed successfully.</p>
        <button class="success-btn" id="successBtn">Continue</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  // Set Text
  document.getElementById("successTitle").innerText = title;
  document.getElementById("successMessage").innerText = message;
  
  // Refresh Button Listeners
  const btn = document.getElementById("successBtn");
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  
  newBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    if (callback) callback();
  });
  
  // Activate CSS animations
  setTimeout(() => overlay.classList.add("active"), 10);
};
