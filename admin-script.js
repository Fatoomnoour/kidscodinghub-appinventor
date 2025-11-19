document.addEventListener('DOMContentLoaded', function() {
    // معلومات الاتصال (يجب استبدالها بالقيم الحقيقية)
    const config = {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbzkVpFAoJ0SREmE6ZVrhAnmn8WisNC1Qbws9SrZSjRKshG6NQ3OXQMSiowKxFoh2lnO/exec',
        secretKey: 'YourSuperSecretKey123' // <-- نفس المفتاح السري الذي وضعته في Google Script
    };

    // عناصر الصفحة
    const loginGate = document.getElementById('login-gate');
    const dashboardPage = document.getElementById('dashboard-page');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const tableBody = document.getElementById('table-body');

    // التحقق من وجود مفتاح وصول في Session Storage (للاحتفاظ بجلسة الدخول)
    if (sessionStorage.getItem('isAdminLoggedIn')) {
        showDashboard();
    }

    // حدث تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const accessKey = document.getElementById('access-key').value;
        
        if (accessKey === config.secretKey) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
            setTimeout(() => {
                loginError.classList.add('hidden');
            }, 3000);
        }
    });

    // حدث تسجيل الخروج
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('isAdminLoggedIn');
        showLoginGate();
    });

    // حدث تحديث البيانات
    refreshBtn.addEventListener('click', loadData);

    function showLoginGate() {
        loginGate.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
    }

    function showDashboard() {
        loginGate.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        loadData();
    }

    // دالة لتحميل البيانات من Google Sheets
    function loadData() {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        refreshBtn.disabled = true;

        // إرسال طلب إلى Google Apps Script مع المفتاح السري
        fetch(`${config.googleScriptUrl}?key=${config.secretKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayData(data.data);
                    updateStats(data.data);
                } else {
                    console.error('Error:', data.message);
                    alert('فشل تحميل البيانات: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('حدث خطأ أثناء الاتصال بالخادم.');
            })
            .finally(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> تحديث';
                refreshBtn.disabled = false;
            });
    }

    // دالة لعرض البيانات في الجدول
    function displayData(data) {
        tableBody.innerHTML = '';
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            // تنسيق التاريخ
            const date = new Date(row['التاريخ']);
            const formattedDate = date.toLocaleDateString('ar-EG');
            
            // تحديد حالة التسجيل
            let statusClass = 'new';
            if (row['الحالة'] === 'قيد المعالجة') statusClass = 'processing';
            else if (row['الحالة'] === 'مكتمل') statusClass = 'completed';
            
            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${row['اسم ولي الأمر']}</td>
                <td>${row['رقم الهاتف']}</td>
                <td>${row['البريد الإلكتروني']}</td>
                <td>${row['اسم الطفل']}</td>
                <td>${row['عمر الطفل']}</td>
                <td>${row['المستوى المطلوب']}</td>
                <td><span class="status ${statusClass}">${row['الحالة']}</span></td>
            `;
            
            tableBody.appendChild(tr);
        });
    }

    // دالة لتحديث الإحصائيات
    function updateStats(data) {
        // إجمالي التسجيلات
        document.getElementById('total-registrations').textContent = data.length;
        
        // التسجيلات الجديدة (خلال آخر 7 أيام)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newRegistrations = data.filter(row => new Date(row['التاريخ']) > sevenDaysAgo).length;
        document.getElementById('new-registrations').textContent = newRegistrations;
        
        // عدد التسجيلات حسب المستوى
        const beginnerCount = data.filter(row => row['المستوى المطلوب'].includes('المستوى الأول')).length;
        const advancedCount = data.filter(row => row['المستوى المطلوب'].includes('المستوى الثالث')).length;
        
        document.getElementById('beginner-count').textContent = beginnerCount;
        document.getElementById('advanced-count').textContent = advancedCount;
    }
});