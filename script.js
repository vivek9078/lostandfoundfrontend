// DOM Elements
const foundTab = document.getElementById('found-tab');
const lostTab = document.getElementById('lost-tab');
const foundFormSection = document.getElementById('found-form');
const lostFormSection = document.getElementById('lost-form');
const foundForm = document.getElementById('foundItemForm');
const lostForm = document.getElementById('lostItemForm');
const searchResults = document.getElementById('searchResults');

// Tab switching logic
function switchTabs(tab) {
  if (tab === 'found') {
    foundTab.classList.add('active');
    foundTab.setAttribute('aria-selected', 'true');
    lostTab.classList.remove('active');
    lostTab.setAttribute('aria-selected', 'false');
    foundFormSection.classList.remove('hidden');
    lostFormSection.classList.add('hidden');
  } else {
    lostTab.classList.add('active');
    lostTab.setAttribute('aria-selected', 'true');
    foundTab.classList.remove('active');
    foundTab.setAttribute('aria-selected', 'false');
    foundFormSection.classList.add('hidden');
    lostFormSection.classList.remove('hidden');
  }
}

foundTab.addEventListener('click', () => switchTabs('found'));
lostTab.addEventListener('click', () => switchTabs('lost'));

// Found Item Submit
foundForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    email: document.getElementById('foundEmail').value.trim(),
    item_name: document.getElementById('foundName').value.trim(),
    color: document.getElementById('foundColor').value.trim(),
    brand: document.getElementById('foundBrand').value.trim(),
    location: document.getElementById('foundLocation').value.trim()
  };

  try {
    const res = await fetch('https://lostandfoundbackend-trb4.onrender.com/api/found', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert('✅ Found item registered successfully! Check your email to verify.');
      foundForm.reset();
    } else {
      alert('❌ Failed to register found item.');
    }
  } catch (err) {
    console.error(err);
    alert('🚫 Server error. Try again later.');
  }
});

// Lost Item (Search) Submit
lostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  searchResults.innerHTML = "Searching...";

  const data = {
    item_name: document.getElementById('lostName').value.trim(),
    color: document.getElementById('lostColor').value.trim(),
    brand: document.getElementById('lostBrand').value.trim()
  };

  try {
    const res = await fetch('https://lostandfoundbackend-trb4.onrender.com/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const results = await res.json();
    searchResults.innerHTML = '';

    if (results.length > 0) {
      results.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
          <strong>Item:</strong> ${item.item_name}<br>
          <strong>Color:</strong> ${item.color}<br>
          <strong>Brand:</strong> ${item.brand || "N/A"}<br>
          <strong>Found at:</strong> ${item.location}<br>
          <strong>Contact:</strong> ${item.email}<br>
          <button class="claimBtn" data-id="${item.id}">✅ Claim This Item</button>
          <hr>
        `;
        searchResults.appendChild(div);
      });

      // Attach click handler to all claim buttons
      document.querySelectorAll('.claimBtn').forEach(button => {
        button.addEventListener('click', async () => {
          const itemId = button.getAttribute('data-id');
          const claimerEmail = prompt('Enter your email to claim this item:');

          if (!claimerEmail || !claimerEmail.includes('@')) {
            return alert('❌ Please enter a valid email.');
          }

          try {
            const res = await fetch(`https://lostandfoundbackend-trb4.onrender.com/api/claim/${itemId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: claimerEmail })
            });

            const result = await res.json();

            if (res.ok) {
              alert('✅ Item claimed successfully!');
              button.parentElement.remove(); // remove this claimed item from UI
            } else {
              alert(`❌ ${result.message}`);
            }
          } catch (err) {
            console.error(err);
            alert('🚫 Error claiming item. Try again later.');
          }
        });
      });

    } else {
      searchResults.innerHTML = "<div>No matching items found.</div>";
    }
  } catch (err) {
    console.error(err);
    searchResults.innerHTML = "<div>Server error. Please try again later.</div>";
  }
});

// Dark Mode Toggle
document.getElementById('modeBtn').addEventListener('click', function () {
  document.body.classList.toggle('dark');
});
