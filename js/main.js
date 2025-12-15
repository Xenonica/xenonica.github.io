document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Animation Logic ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Function to observe elements (useful for re-observing after pagination)
    const observeElements = () => {
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach((el) => observer.observe(el));
    };
    
    // Initial observation
    observeElements();


    // --- Pagination Logic ---
    // Pagination is only active if .projects-grid exists on the page
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) { // Only run on pages with projects-grid
        const projectCards = Array.from(projectsGrid.querySelectorAll('.project-card'));
        const paginationContainer = document.querySelector('.pagination-container');
        const itemsPerPage = 3;
        let currentPage = 1;
        const totalPages = Math.ceil(projectCards.length / itemsPerPage);

        // Function to display a specific page of projects
        function showPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            projectCards.forEach((card, index) => {
                if (index >= start && index < end) {
                    // Show card
                    card.style.display = 'flex'; 
                    
                    // Re-trigger scroll animation:
                    // 1. Remove 'show' class to reset state
                    // 2. Add 'hidden' class to set initial hidden state
                    // 3. Observe the element so the IntersectionObserver adds 'show' when in view
                    card.classList.remove('show'); 
                    card.classList.add('hidden');
                    observer.observe(card);
                } else {
                    // Hide card
                    card.style.display = 'none';
                }
            });
            
            // Scroll to top of projects section smoothly when changing pages (except initial load)
            if(page !== 1) {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            updatePaginationControls();
        }

        // Function to render pagination buttons (Prev, 1, 2, 3... Next)
        function updatePaginationControls() {
            if (!paginationContainer) return;
            
            paginationContainer.innerHTML = '';
            
            if (totalPages <= 1) return; // Hide controls if only 1 page

            // Prev Button
            const prevBtn = document.createElement('button');
            prevBtn.innerText = 'Previous';
            prevBtn.classList.add('pagination-btn');
            prevBtn.setAttribute('aria-label', 'Previous Page');
            if (currentPage === 1) prevBtn.disabled = true;
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    showPage(currentPage);
                }
            });
            paginationContainer.appendChild(prevBtn);

            // Page Numbers
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = i;
                pageBtn.classList.add('pagination-btn', 'page-number');
                pageBtn.setAttribute('aria-label', `Page ${i}`);
                if (i === currentPage) {
                     pageBtn.classList.add('active');
                     pageBtn.setAttribute('aria-current', 'page');
                }
                pageBtn.addEventListener('click', () => {
                    currentPage = i;
                    showPage(currentPage);
                });
                paginationContainer.appendChild(pageBtn);
            }

            // Next Button
            const nextBtn = document.createElement('button');
            nextBtn.innerText = 'Next';
            nextBtn.classList.add('pagination-btn');
            nextBtn.setAttribute('aria-label', 'Next Page');
            if (currentPage === totalPages) nextBtn.disabled = true;
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    showPage(currentPage);
                }
            });
            paginationContainer.appendChild(nextBtn);
            
            // Observe pagination container itself so it fades in if it was hidden
            if (paginationContainer.classList.contains('hidden')) {
                observer.observe(paginationContainer);
            }
        }

        // Initialize Pagination (show page 1)
        showPage(1);
    }

    // --- Dark Mode Logic ---
    // Inject Toggle Button
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.className = 'theme-btn';
        themeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Default to Moon
        navContainer.appendChild(themeToggleBtn);

        // Check saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemTheme)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // Toggle Event
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }

    // --- Image Modal Logic ---
    // Add click handlers to all carousel images for enlargement
    const carouselImages = document.querySelectorAll('.carousel-item img');
    if (carouselImages.length > 0) {
        carouselImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                openModal(this.src);
            });
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Image modal functions (global scope for onclick attributes)
function openModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}
