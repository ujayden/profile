window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Initialize GLightbox
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = GLightbox({
        selector: '.glightbox'
    });
});

// Copy ID functionality with tooltip and first-time alert
document.addEventListener('DOMContentLoaded', () => {
    const copyBtns = document.querySelectorAll('.copy-id-btn');
    const firstCopyAlert = document.getElementById('first_copy_alert');
    let hasShownAlert = false;

    const executeCopy = async (btn) => {
        const textToCopy = btn.getAttribute('data-copy-id');
        const tooltipWrapper = btn.closest('.tooltip');
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            let originalTip = '';
            
            if (tooltipWrapper) {
                originalTip = tooltipWrapper.getAttribute('data-tip');
                tooltipWrapper.setAttribute('data-tip', 'Copied!');
            }
            
            setTimeout(() => {
                if (tooltipWrapper) {
                    tooltipWrapper.setAttribute('data-tip', originalTip);
                }
            }, 1500);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Always copy immediately
            executeCopy(btn);

            // Show alert first time
            if (!hasShownAlert && firstCopyAlert) {
                const toastContainer = document.getElementById('toast_container');
                if (toastContainer) toastContainer.style.display = 'block';

                firstCopyAlert.classList.remove('-translate-y-10', 'opacity-0');
                firstCopyAlert.classList.add('translate-y-0', 'opacity-100');
                hasShownAlert = true;
                
                // Hide automatically after 8 seconds
                setTimeout(() => {
                    firstCopyAlert.classList.remove('translate-y-0', 'opacity-100');
                    firstCopyAlert.classList.add('-translate-y-10', 'opacity-0');
                    setTimeout(() => {
                        if (toastContainer) toastContainer.style.display = 'none';
                    }, 500); // Wait for transition
                }, 8000);
            }
        });
    });
});
