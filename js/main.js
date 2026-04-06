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


    // --- Pagination & Filtering Logic ---
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        const allProjectCards = Array.from(projectsGrid.querySelectorAll('.project-card'));
        const paginationContainer = document.querySelector('.pagination-container');
        const itemsPerPage = 3;
        let currentPage = 1;

        // Check for tag in URL
        const urlParams = new URLSearchParams(window.location.search);
        const activeTag = urlParams.get('tag');

        // Filter cards if tag is present
        let projectCards = activeTag 
            ? allProjectCards.filter(card => {
                const dataTagsStr = card.getAttribute('data-tags') || '';
                const dataTags = dataTagsStr.split(',').map(t => t.trim().toLowerCase());
                const visualTags = Array.from(card.querySelectorAll('.tech-tag')).map(t => t.textContent.trim().toLowerCase());
                
                const searchTag = activeTag.toLowerCase();
                return dataTags.includes(searchTag) || visualTags.includes(searchTag);
            })
            : allProjectCards;

        // Add filter status if filtering
        if (activeTag) {
            const filterStatus = document.createElement('div');
            filterStatus.className = 'filter-status';
            filterStatus.innerHTML = `
                <span>Showing projects with tag: <strong>${activeTag}</strong></span>
                <a href="index.html#projects" class="clear-filter">Clear Filter</a>
            `;
            projectsGrid.parentNode.insertBefore(filterStatus, projectsGrid);
        }

        let totalPages = Math.ceil(projectCards.length / itemsPerPage);

        function showPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            // Hide all first
            allProjectCards.forEach(card => card.style.display = 'none');

            // Show and animate filtered ones
            projectCards.forEach((card, index) => {
                if (index >= start && index < end) {
                    card.style.display = 'flex'; 
                    card.classList.remove('show'); 
                    card.classList.add('hidden');
                    observer.observe(card);
                }
            });
            
            if(page !== 1) {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            updatePaginationControls();
        }

        function updatePaginationControls() {
            if (!paginationContainer) return;
            paginationContainer.innerHTML = '';
            if (totalPages <= 1) return;

            const prevBtn = document.createElement('button');
            prevBtn.innerText = 'Previous';
            prevBtn.classList.add('pagination-btn');
            if (currentPage === 1) prevBtn.disabled = true;
            prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; showPage(currentPage); } };
            paginationContainer.appendChild(prevBtn);

            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = i;
                pageBtn.classList.add('pagination-btn', 'page-number');
                if (i === currentPage) pageBtn.classList.add('active');
                pageBtn.onclick = () => { currentPage = i; showPage(currentPage); };
                paginationContainer.appendChild(pageBtn);
            }

            const nextBtn = document.createElement('button');
            nextBtn.innerText = 'Next';
            nextBtn.classList.add('pagination-btn');
            if (currentPage === totalPages) nextBtn.disabled = true;
            nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; showPage(currentPage); } };
            paginationContainer.appendChild(nextBtn);
            
            if (paginationContainer.classList.contains('hidden')) {
                observer.observe(paginationContainer);
            }
        }

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

    // --- Dynamic Copyright Year ---
    const updateYear = () => {
        const yearElements = document.querySelectorAll('.copyright-year');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    };
    updateYear();
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
