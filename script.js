document.addEventListener('DOMContentLoaded', function() {
    // Configuration variables
    const config = {
        googleScriptUrl:'https://script.google.com/macros/s/AKfycbzkVpFAoJ0SREmE6ZVrhAnmn8WisNC1Qbws9SrZSjRKshG6NQ3OXQMSiowKxFoh2lnO/exec',
        whatsappNumber: '+201097430973',
        successMessage: 'تم إرسال طلبك بنجاح!',
        errorMessage: 'حدث خطأ! يرجى المحاولة مرة أخرى.'
    };

    // Theme Toggle
    const themeToggleSwitch = document.getElementById('theme-toggle-switch');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);
    
    themeToggleSwitch.addEventListener('click', function() {
        const theme = htmlElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Form submission with Google Sheets integration
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'جاري الإرسال...';
            submitBtn.disabled = true;
            
            // Collect form data
            const formElements = this.elements;
            let formData = {};
            
            for (let i = 0; i < formElements.length; i++) {
                if (formElements[i].name) {
                    formData[formElements[i].name] = formElements[i].value;
                }
            }
            
            // Send data to Google Sheets
            fetch(config.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors', // مهم للعمل مع Google Apps Script
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                // Since we're using no-cors, we can't read the response
                // We'll assume it was successful and show the success modal
                
                // Prepare WhatsApp message
                const levelText = {
                    'beginner': 'المستوى الأول: أسس الإبداع الرقمي',
                    'intermediate': 'المستوى الثاني: غوص أعمق في عالم تطوير التطبيقات',
                    'advanced': 'المستوى الثالث: نحو الاحتراف',
                    'all': 'الحزمة الكاملة (الثلاثة مستويات)'
                };
                
                const whatsappMessage = `📝 طلب تسجيل جديد في كورس App Inventor\n\n` +
                    `👤 اسم ولي الأمر: ${formData.name}\n` +
                    `📞 رقم الهاتف: ${formData.phone}\n` +
                    `📧 البريد الإلكتروني: ${formData.email}\n` +
                    `👶 اسم الطفل: ${formData['child-name']}\n` +
                    `🎂 عمر الطفل: ${formData['child-age']} سنة\n` +
                    `📚 المستوى المطلوب: ${levelText[formData.level]}\n\n` +
                    `📅 تاريخ التسجيل: ${new Date().toLocaleDateString('ar-EG')}`;
                
                // Show success modal
                const modal = document.getElementById('success-modal');
                modal.style.display = 'flex';
                
                // WhatsApp button functionality
                const whatsappBtn = document.getElementById('whatsapp-btn');
                whatsappBtn.onclick = function() {
                    const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
                    window.open(whatsappUrl, '_blank');
                };
                
                // Reset the form
                registrationForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(config.errorMessage); // Simple fallback for error
            })
            .finally(() => {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // Close modal functionality
    const closeModalBtn = document.getElementById('close-modal');
    const successModal = document.getElementById('success-modal');
    
    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
        });
        
        // Also close modal when clicking outside of it
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.style.display = 'none';
            }
        });
    }
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });
    
    // Simulate badge unlocking after course completion
    function unlockBadge(badgeIndex) {
        const badges = document.querySelectorAll('.badge');
        if (badges[badgeIndex]) {
            badges[badgeIndex].classList.remove('locked');
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '100px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'var(--card-bg)';
            notification.style.color = 'var(--text-color)';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '10px';
            notification.style.boxShadow = 'var(--card-shadow)';
            notification.style.zIndex = '10000';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.gap = '10px';
            notification.style.animation = 'slideInRight 0.5s ease';
            
            const badgeTitle = badges[badgeIndex].querySelector('h4').textContent;
            notification.innerHTML = `
                <i class="fas fa-trophy" style="color: var(--secondary-color); font-size: 1.5rem;"></i>
                <div>
                    <strong>تهانينا!</strong><br>
                    لقد حصلت على شارة: ${badgeTitle}
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }, 5000);
        }
    }
    
    // Add animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Example: Unlock first badge after 3 seconds (for demonstration)
    // Remove this line in production
    // setTimeout(() => {
    //     unlockBadge(0);
    // }, 3000);
});