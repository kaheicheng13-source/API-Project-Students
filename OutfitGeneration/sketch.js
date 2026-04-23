const ACCESS_KEY = 'jTJ8Th63clOX13lVN5u3BYNol1wsRw_WEnUYQ4nG3KI'; 

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm"); 
  const promptInput = document.getElementById("promptInput"); 
  const statusEl = document.getElementById("status"); 
  const resultsEl = document.getElementById("results");
  
  if(!form|| !promptInput || !statusEl || !resultsEl) {
    console.error("Oops! You are missing an element in your prompt!");
    return;
  }
  
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const prompt = promptInput.value.trim();
    if(!prompt) return;
    
    await searchUnsplash(prompt);
  }); 
  
  async function searchUnsplash(prompt){
    setStatus("Search for images....");
    clearResults();
    
    const endpoint = new URL("https://api.unsplash.com/search/photos");
    endpoint.searchParams.set("query", prompt); 
    endpoint.searchParams.set("pages", "1"); 
    endpoint.searchParams.set("per_page", "10"); 
    endpoint.searchParams.set("order_by", "relevant"); 
    endpoint.searchParams.set("content_filter", "high");
    
    try{
      const response = await fetch(endpoint.toString(), { 
        headers: { 
          Authorization: `Client-ID ${ACCESS_KEY}`, 
          "Accept-Version": "v1" 
        }
      });
      
      if(!response.ok){
        throw new Error(`Request Failed with status${response.status}`);
      }
      
      const data = await response.json();
      
      if(!data.results || data.results.length === 0) {
        setStatus("No images found with the prompt input.");
        return;
      }
      
      data.results.forEach((photo, index) => {
        const description = 
              photo.description || photo.alt_description || `Result ${index + 1} for "${prompt}"`;

      

  // const description = photo.description || photo.alt_description || "Image result"; 
        const photographerName = photo.user?.name || "Unknown photographer";
        const photographerLink = `${photo.user?.links?.html}?utm_source=your_app_name&utm_medium=referral`;
        const unsplashLink = `https://unsplash.com/?utm_source=your_app_name&utm_medium=referral`;

        const card = document.createElement("article");
        card.className = "image-card";

        card.innerHTML = `
          <img src="${photo.urls.small}" alt="${escapeHtml(description)}">
          <div class="image-meta">
            <p class="image-description">${escapeHtml(description)}</p>
            <p class="image-credit">
              Photo by
              <a href="${photographerLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(photographerName)}</a>
              on
              <a href="${unsplashLink}" target="_blank" rel="noopener noreferrer">Unsplash</a>
            </p>
          </div>
        `;
      
      resultsEl.appendChild(card);
    });
    
    resultsEl.classList.remove("hidden");
    setStatus(`Showing ${data.results.length} results.`);
  } catch (error) {
    console.error(error);
    setStatus("Something went wrong while fetching the images.");
    }
  }
                         
  function setStatus(message) {
    statusEl.textContent = message;
  }

  function clearResults() {
    resultsEl.innerHTML = "";
    resultsEl.classList.add("hidden");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});