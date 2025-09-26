// PWA Enhanced Farming Robot Controller Application
class FarmingRobotPWA {
    constructor() {
        this.currentLanguage = 'english';
        this.currentScreen = 'dashboard-screen';
        this.currentTheme = 'light';
        this.robotData = null;
        this.taskChart = null;
        this.pathCanvas = null;
        this.pathContext = null;
        this.isDrawing = false;
        this.pathPoints = [];
        this.deferredPrompt = null;
        this.isOffline = !navigator.onLine;
        this.lastSyncTime = new Date();
        
        // Touch handling for pull-to-refresh
        this.touchStartY = 0;
        this.touchCurrentY = 0;
        this.isPulling = false;
        
        this.translations = {
            english: {
                dashboard: "Dashboard",
                taskLog: "Task Log", 
                liveFeed: "Live Feed",
                pathControl: "Path & Control",
                weather: "Weather & Soil",
                settings: "Settings",
                start: "Start",
                stop: "Stop",
                emergency: "Emergency Stop",
                battery: "Battery",
                areaCovered: "Area Covered",
                timeRemaining: "Time Remaining",
                working: "Working",
                progress: "Progress",
                export: "Export",
                theme: "Theme",
                notifications: "Notifications",
                install: "Install App",
                offline: "Offline Mode"
            },
            hindi: {
                dashboard: "डैशबोर्ड",
                taskLog: "कार्य रिकॉर्ड",
                liveFeed: "लाइव फीड", 
                pathControl: "पथ नियंत्रण",
                weather: "मौसम और मिट्टी",
                settings: "सेटिंग्स",
                start: "शुरू करें",
                stop: "रोकें",
                emergency: "आपातकालीन स्टॉप",
                battery: "बैटरी",
                areaCovered: "कवर क्षेत्र", 
                timeRemaining: "समय शेष",
                working: "कार्यरत",
                progress: "प्रगति",
                export: "निर्यात",
                theme: "थीम",
                notifications: "सूचनाएं",
                install: "ऐप इंस्टॉल करें",
                offline: "ऑफलाइन मोड"
            },
            tamil: {
                dashboard: "டாஷ்போர்டு",
                taskLog: "பணி பதிவு",
                liveFeed: "நேரடி ஊட்டம்",
                pathControl: "பாதை கட்டுப்பாடு", 
                weather: "வானிலை மற்றும் மண்",
                settings: "அமைப்புகள்",
                start: "தொடங்கு", 
                stop: "நிறுத்து",
                emergency: "அவசரநிலை நிறுத்தம்",
                battery: "பேட்டரி",
                areaCovered: "மூடப்பட்ட பகுதி",
                timeRemaining: "மீதமுள்ள நேரம்",
                working: "வேலை செய்கிறது",
                progress: "முன்னேற்றம்",
                export: "ஏற்றுமதி",
                theme: "தீம்",
                notifications: "அறிவிப்புகள்",
                install: "ஆப் நிறுவு",
                offline: "ஆஃப்லைன் முறை"
            }
        };

        // Mock robot data
        this.robotData = {
            id: "robot_001",
            name: "AgroBot Alpha",
            status: "working",
            battery: 78,
            location: {lat: 28.6139, lng: 77.2090},
            areaCovered: 2.5,
            totalArea: 5.0,
            timeRemaining: 145,
            connectivity: "strong",
            speed: 2.5
        };

        this.tasks = [
            {date: "2025-09-22", area: 3.2, timeTaken: 210, status: "completed", errors: 0},
            {date: "2025-09-21", area: 2.8, timeTaken: 165, status: "completed", errors: 1},
            {date: "2025-09-20", area: 4.1, timeTaken: 210, status: "completed", errors: 0},
            {date: "2025-09-19", area: 2.9, timeTaken: 155, status: "completed", errors: 0},
            {date: "2025-09-18", area: 3.5, timeTaken: 195, status: "completed", errors: 2}
        ];

        this.init();
    }

    async init() {
        this.setupPWA();
        this.setupEventListeners();
        this.setupTheme();
        this.setupPullToRefresh();
        this.updateTranslations();
        this.updateDashboard();
        this.setupTaskChart();
        this.setupPathCanvas();
        this.startDataUpdates();
        this.updateOfflineStatus();
        
        // Initial welcome message
        setTimeout(() => {
            this.showAlert('success', '🚀 AgroBot Controller ready! Welcome farmer!', 3000);
        }, 1000);
        
        // Show install prompt if available
        setTimeout(() => {
            this.checkInstallPrompt();
        }, 5000);
    }

    async setupPWA() {
        // Generate and inject manifest
        this.generateManifest();
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(this.generateServiceWorker());
                console.log('ServiceWorker registered successfully');
                
                registration.addEventListener('updatefound', () => {
                    this.showAlert('info', '📱 App update available! Refresh to get latest version.', 5000);
                });
            } catch (error) {
                console.log('ServiceWorker registration failed');
            }
        }

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            this.hideInstallBanner();
            this.showAlert('success', '🎉 App installed successfully! Launch from home screen.', 4000);
        });
    }

    generateManifest() {
        const manifest = {
            name: "AgroBot Controller",
            short_name: "AgroBot",
            description: "Control and monitor autonomous seed-sowing farming robots",
            start_url: "./",
            display: "standalone",
            theme_color: "#4CAF50",
            background_color: "#FFFFFF",
            orientation: "portrait-primary",
            scope: "./",
            lang: "en",
            categories: ["agriculture", "productivity", "utilities"],
            icons: [
                {
                    src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiM0Q0FGNTAIIC8+Cjx0ZXh0IHg9Ijk2IiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjgwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+klTwvdGV4dD4KPC9zdmc+",
                    sizes: "192x192",
                    type: "image/svg+xml",
                    purpose: "any maskable"
                },
                {
                    src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiByeD0iNjQiIGZpbGw9IiM0Q0FGNTAIIC8+Cjx0ZXh0IHg9IjI1NiIgeT0iMzAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn6SVPC90ZXh0Pgo8L3N2Zz4=",
                    sizes: "512x512",
                    type: "image/svg+xml"
                }
            ]
        };

        const manifestBlob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
        const manifestURL = URL.createObjectURL(manifestBlob);
        const manifestElement = document.getElementById('manifest-placeholder');
        if (manifestElement) {
            manifestElement.href = manifestURL;
        }
    }

    generateServiceWorker() {
        const swCode = `
            const CACHE_NAME = 'agrobot-v1.0.0';
            const urlsToCache = [
                './',
                './index.html',
                './style.css', 
                './app.js',
                'https://cdn.jsdelivr.net/npm/chart.js'
            ];

            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(cache => cache.addAll(urlsToCache))
                );
            });

            self.addEventListener('fetch', event => {
                event.respondWith(
                    caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        })
                );
            });

            self.addEventListener('activate', event => {
                event.waitUntil(
                    caches.keys().then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                if (cacheName !== CACHE_NAME) {
                                    return caches.delete(cacheName);
                                }
                            })
                        );
                    })
                );
            });
        `;

        const swBlob = new Blob([swCode], {type: 'application/javascript'});
        return URL.createObjectURL(swBlob);
    }

    setupEventListeners() {
        // Language selectors
        const languageSelect = document.getElementById('language-select');
        const settingsLanguageSelect = document.getElementById('settings-language');
        
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }
        
        if (settingsLanguageSelect) {
            settingsLanguageSelect.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
                if (languageSelect) languageSelect.value = e.target.value;
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                this.toggleTheme(e.target.checked ? 'dark' : 'light');
            });
        }

        // Install buttons
        const installAppBtn = document.getElementById('install-app-btn');
        const installPwaBtn = document.getElementById('install-pwa-btn');
        const dismissInstallBtn = document.getElementById('dismiss-install');

        if (installAppBtn) {
            installAppBtn.addEventListener('click', () => this.installApp());
        }
        if (installPwaBtn) {
            installPwaBtn.addEventListener('click', () => this.installApp());
        }
        if (dismissInstallBtn) {
            dismissInstallBtn.addEventListener('click', () => this.hideInstallBanner());
        }

        // Navigation
        this.setupNavigation();
        
        // Control buttons
        this.setupControlButtons();
        
        // Other interactive elements
        this.setupOtherElements();

        // Online/Offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Visibility change (for PWA lifecycle)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });
    }

    setupTheme() {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme = prefersDark ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!document.querySelector('#theme-toggle').checked) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
            }
        });
    }

    toggleTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.showAlert('info', `🎨 Switched to ${theme} mode`, 2000);
        
        // Update chart if visible
        if (this.taskChart && this.currentScreen === 'task-log-screen') {
            setTimeout(() => {
                this.updateChartTheme();
            }, 100);
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
        
        // Update meta theme color
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#121212' : '#4CAF50';
        }
    }

    setupPullToRefresh() {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        appContainer.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                this.touchStartY = e.touches[0].clientY;
            }
        }, {passive: true});

        appContainer.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0) {
                this.touchCurrentY = e.touches[0].clientY;
                const pullDistance = this.touchCurrentY - this.touchStartY;
                
                if (pullDistance > 50 && !this.isPulling) {
                    this.isPulling = true;
                    this.showPullRefreshIndicator();
                }
            }
        }, {passive: true});

        appContainer.addEventListener('touchend', () => {
            if (this.isPulling) {
                this.isPulling = false;
                this.hidePullRefreshIndicator();
                this.refreshData();
            }
            this.touchStartY = 0;
            this.touchCurrentY = 0;
        }, {passive: true});
    }

    showPullRefreshIndicator() {
        const indicator = document.getElementById('refresh-indicator');
        if (indicator) {
            indicator.classList.add('active');
        }
    }

    hidePullRefreshIndicator() {
        const indicator = document.getElementById('refresh-indicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }

    refreshData() {
        this.showAlert('info', '🔄 Refreshing data...', 1000);
        
        // Simulate data refresh
        setTimeout(() => {
            this.updateDashboard();
            if (this.currentScreen === 'task-log-screen' && this.taskChart) {
                this.taskChart.update();
            }
            this.lastSyncTime = new Date();
            this.updateLastSyncTime();
            this.showAlert('success', '✅ Data refreshed successfully!', 2000);
        }, 1000);
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            const targetScreen = btn.dataset.screen;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchScreen(targetScreen);
                this.hapticFeedback();
            });
        });
    }

    setupControlButtons() {
        const buttons = [
            {id: 'start-btn', action: () => this.startRobot()},
            {id: 'stop-btn', action: () => this.stopRobot()},
            {id: 'emergency-btn', action: () => this.emergencyStop()},
            {id: 'voice-command', action: () => this.handleVoiceCommand()},
            {id: 'capture-btn', action: () => this.capturePhoto()},
            {id: 'clear-path', action: () => this.clearPath()},
            {id: 'confirm-path', action: () => this.confirmPath()},
            {id: 'export-btn', action: () => this.exportTaskLog()}
        ];

        buttons.forEach(({id, action}) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    action();
                    this.hapticFeedback();
                });
            }
        });
    }

    setupOtherElements() {
        // Direction controls
        const directionBtns = document.querySelectorAll('.direction-btn');
        directionBtns.forEach(btn => {
            const direction = btn.dataset.direction;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.manualControl(direction);
                this.hapticFeedback();
            });
        });
    }

    switchScreen(screenId) {
        // Hide all screens
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Update navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => btn.classList.remove('active'));
        
        const activeNavBtn = document.querySelector(`[data-screen="${screenId}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }

        // Screen-specific initialization
        this.initializeScreen(screenId);
    }

    initializeScreen(screenId) {
        switch(screenId) {
            case 'task-log-screen':
                setTimeout(() => {
                    this.setupTaskChart();
                }, 100);
                break;
            case 'path-control-screen':
                setTimeout(() => {
                    this.setupPathCanvas();
                }, 100);
                break;
            case 'live-feed-screen':
                this.updateLiveFeed();
                break;
            case 'settings-screen':
                this.updateSettingsScreen();
                break;
        }
    }

    switchLanguage(language) {
        this.currentLanguage = language;
        this.updateTranslations();
        
        // Update both selectors
        const selectors = ['language-select', 'settings-language'];
        selectors.forEach(id => {
            const selector = document.getElementById(id);
            if (selector) selector.value = language;
        });
        
        this.showAlert('info', `🌐 Language switched to ${language}`, 2000);
    }

    updateTranslations() {
        const translations = this.translations[this.currentLanguage];
        
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }

    // Fixed floating point precision issue
    formatNumber(num, decimals = 1) {
        return Number(parseFloat(num).toFixed(decimals));
    }

    updateDashboard() {
        // Update status
        const statusElement = document.getElementById('robot-status');
        if (statusElement) {
            const statusDot = statusElement.querySelector('.status-dot');
            if (statusDot) {
                statusDot.className = `status-dot ${this.robotData.status}`;
            }
        }
        
        // Update values with proper number formatting
        const updates = [
            {id: 'battery-level', value: `${this.robotData.battery}%`},
            {id: 'area-covered', value: `${this.formatNumber(this.robotData.areaCovered)}/${this.formatNumber(this.robotData.totalArea)}`},
            {id: 'time-remaining', value: `${Math.floor(this.robotData.timeRemaining / 60)}h ${this.robotData.timeRemaining % 60}m`}
        ];

        updates.forEach(({id, value}) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // Update progress
        const progressPercentage = Math.round((this.robotData.areaCovered / this.robotData.totalArea) * 100);
        const progressPercElement = document.getElementById('progress-percentage');
        const progressFillElement = document.getElementById('progress-fill');
        
        if (progressPercElement) progressPercElement.textContent = `${progressPercentage}%`;
        if (progressFillElement) progressFillElement.style.width = `${progressPercentage}%`;

        // Update progress bar aria attributes
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', progressPercentage);
        }
    }

    setupTaskChart() {
        const chartCanvas = document.getElementById('task-chart');
        if (!chartCanvas) return;
        
        if (this.taskChart) {
            this.taskChart.destroy();
        }
        
        const isDark = this.currentTheme === 'dark';
        
        this.taskChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: this.tasks.map(task => {
                    const date = new Date(task.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Area Covered (acres)',
                    data: this.tasks.map(task => task.area),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { 
                            display: true, 
                            text: 'Acres',
                            color: isDark ? '#FFFFFF' : '#212121'
                        },
                        ticks: {
                            color: isDark ? '#B0B0B0' : '#757575'
                        },
                        grid: {
                            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: isDark ? '#B0B0B0' : '#757575'
                        },
                        grid: {
                            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    updateChartTheme() {
        if (!this.taskChart) return;
        
        const isDark = this.currentTheme === 'dark';
        
        this.taskChart.options.scales.y.title.color = isDark ? '#FFFFFF' : '#212121';
        this.taskChart.options.scales.y.ticks.color = isDark ? '#B0B0B0' : '#757575';
        this.taskChart.options.scales.y.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        this.taskChart.options.scales.x.ticks.color = isDark ? '#B0B0B0' : '#757575';
        this.taskChart.options.scales.x.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        
        this.taskChart.update();
    }

    setupPathCanvas() {
        const canvas = document.getElementById('path-canvas');
        if (!canvas) return;
        
        this.pathCanvas = canvas;
        this.pathContext = canvas.getContext('2d');
        
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        this.setupCanvasEvents();
    }

    setupCanvasEvents() {
        if (!this.pathCanvas) return;
        
        let isDrawing = false;
        
        const getPos = (e) => {
            const rect = this.pathCanvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
            const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };
        
        const startDrawing = (e) => {
            isDrawing = true;
            this.pathPoints = [getPos(e)];
            this.drawPath();
        };
        
        const draw = (e) => {
            if (!isDrawing) return;
            this.pathPoints.push(getPos(e));
            this.drawPath();
        };
        
        const stopDrawing = () => {
            isDrawing = false;
        };
        
        // Mouse events
        this.pathCanvas.addEventListener('mousedown', startDrawing);
        this.pathCanvas.addEventListener('mousemove', draw);
        this.pathCanvas.addEventListener('mouseup', stopDrawing);
        
        // Touch events
        this.pathCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e);
        });
        this.pathCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(e);
        });
        this.pathCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });
    }

    drawPath() {
        if (!this.pathContext || this.pathPoints.length < 2) return;
        
        this.pathContext.clearRect(0, 0, this.pathCanvas.width, this.pathCanvas.height);
        this.pathContext.strokeStyle = '#1FB8CD';
        this.pathContext.lineWidth = 3;
        this.pathContext.setLineDash([10, 5]);
        this.pathContext.beginPath();
        
        this.pathPoints.forEach((point, i) => {
            if (i === 0) {
                this.pathContext.moveTo(point.x, point.y);
            } else {
                this.pathContext.lineTo(point.x, point.y);
            }
        });
        
        if (this.pathPoints.length > 2) {
            this.pathContext.closePath();
        }
        this.pathContext.stroke();
        
        // Draw start point
        if (this.pathPoints.length > 0) {
            this.pathContext.setLineDash([]);
            this.pathContext.fillStyle = '#28a745';
            this.pathContext.beginPath();
            this.pathContext.arc(this.pathPoints[0].x, this.pathPoints[0].y, 8, 0, 2 * Math.PI);
            this.pathContext.fill();
        }
    }

    clearPath() {
        this.pathPoints = [];
        if (this.pathContext) {
            this.pathContext.clearRect(0, 0, this.pathCanvas.width, this.pathCanvas.height);
        }
        this.showAlert('info', 'Path cleared successfully', 2000);
    }

    confirmPath() {
        if (this.pathPoints.length < 3) {
            this.showAlert('warning', 'Please draw a complete field boundary first', 3000);
            return;
        }
        
        this.showAlert('success', 'Path confirmed! Starting mission...', 3000);
        this.robotData.status = 'working';
        this.updateDashboard();
        
        setTimeout(() => {
            this.switchScreen('dashboard-screen');
        }, 1500);
    }

    startRobot() {
        if (this.robotData.status === 'working') {
            this.showAlert('warning', 'Robot is already working!', 2000);
            return;
        }
        
        this.robotData.status = 'working';
        this.updateDashboard();
        this.showAlert('success', '🚀 Robot started successfully!', 3000);
        
        // Haptic feedback for important actions
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    stopRobot() {
        if (this.robotData.status === 'idle') {
            this.showAlert('warning', 'Robot is already stopped', 2000);
            return;
        }
        
        this.robotData.status = 'idle';
        this.updateDashboard();
        this.showAlert('info', '⏹️ Robot stopped successfully', 3000);
    }

    emergencyStop() {
        this.robotData.status = 'error';
        this.updateDashboard();
        this.showAlert('error', '🚨 EMERGENCY STOP ACTIVATED! 🚨', 5000);
        
        // Strong haptic feedback for emergency
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
        }
    }

    handleVoiceCommand() {
        // Simulate voice recognition
        const commands = [
            {text: 'Start robot', action: () => this.startRobot()},
            {text: 'Stop robot', action: () => this.stopRobot()},
            {text: 'Battery status', action: () => this.showAlert('info', `🔋 Battery: ${this.robotData.battery}%`, 3000)},
            {text: 'Area covered', action: () => this.showAlert('info', `📍 Area: ${this.formatNumber(this.robotData.areaCovered)}/${this.formatNumber(this.robotData.totalArea)} acres`, 3000)},
            {text: 'Emergency stop', action: () => this.emergencyStop()}
        ];
        
        const randomCommand = commands[Math.floor(Math.random() * commands.length)];
        this.showAlert('info', `🎤 Voice: "${randomCommand.text}"`, 2000);
        
        setTimeout(() => {
            randomCommand.action();
        }, 1000);
    }

    capturePhoto() {
        this.showAlert('success', '📸 Photo captured successfully!', 2000);
        
        const overlay = document.getElementById('alert-overlay');
        if (overlay) {
            const messages = ['⚠️ Animal Detected', '🌱 Healthy Crops', '🚜 Normal Operation', '⚠️ Obstacle Found'];
            const message = messages[Math.floor(Math.random() * messages.length)];
            
            const messageEl = overlay.querySelector('.alert-message');
            if (messageEl) messageEl.textContent = message;
            
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('hidden'), 3000);
        }
    }

    manualControl(direction) {
        const dirs = {
            up: '⬆️ Forward', 
            down: '⬇️ Backward', 
            left: '⬅️ Left', 
            right: '➡️ Right', 
            stop: '⏹️ Stop'
        };
        this.showAlert('info', `Manual control: ${dirs[direction]}`, 1500);
    }

    exportTaskLog() {
        this.showAlert('success', '📄 Task log exported successfully!', 3000);
        
        // Simulate export
        const csvContent = this.tasks.map(task => 
            `${task.date},${task.area},${task.timeTaken},${task.status},${task.errors}`
        ).join('\n');
        
        console.log('Exported CSV:', csvContent);
    }

    updateLiveFeed() {
        const updateTime = () => {
            const timeEl = document.getElementById('last-update');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString();
            }
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    updateSettingsScreen() {
        const offlineStatusEl = document.getElementById('offline-status');
        if (offlineStatusEl) {
            offlineStatusEl.textContent = this.isOffline ? 'Offline' : 'Online';
            offlineStatusEl.className = this.isOffline ? 'status-offline' : 'status-online';
        }
        
        this.updateLastSyncTime();
    }

    updateLastSyncTime() {
        const lastSyncEl = document.getElementById('last-sync');
        if (lastSyncEl) {
            const timeDiff = Date.now() - this.lastSyncTime.getTime();
            const minutes = Math.floor(timeDiff / 60000);
            
            if (minutes < 1) {
                lastSyncEl.textContent = 'Just now';
            } else if (minutes < 60) {
                lastSyncEl.textContent = `${minutes}m ago`;
            } else {
                lastSyncEl.textContent = `${Math.floor(minutes / 60)}h ago`;
            }
        }
    }

    updateOfflineStatus() {
        this.isOffline = !navigator.onLine;
        this.updateSettingsScreen();
    }

    handleOnline() {
        this.isOffline = false;
        this.updateSettingsScreen();
        this.showAlert('success', '🌐 Back online! Syncing data...', 2000);
        this.refreshData();
    }

    handleOffline() {
        this.isOffline = true;
        this.updateSettingsScreen();
        this.showAlert('warning', '📡 You are offline. Some features may be limited.', 3000);
    }

    startDataUpdates() {
        setInterval(() => {
            if (this.robotData.status === 'working') {
                if (this.robotData.areaCovered < this.robotData.totalArea) {
                    this.robotData.areaCovered = Math.min(this.robotData.totalArea, this.robotData.areaCovered + 0.1);
                    this.robotData.timeRemaining = Math.max(0, this.robotData.timeRemaining - 2);
                }
                
                if (this.robotData.battery > 0) {
                    this.robotData.battery = Math.max(0, this.robotData.battery - 1);
                }
                
                // Battery warning
                if (this.robotData.battery <= 20 && this.robotData.battery > 15) {
                    this.showAlert('warning', '🔋 Low battery: 20% remaining', 4000);
                }
                
                this.updateDashboard();
            }
            
            // Random events
            if (Math.random() < 0.08) {
                const events = [
                    {type: 'info', message: '✅ Robot operating normally'},
                    {type: 'warning', message: '⚠️ Obstacle detected, adjusting path'},
                    {type: 'info', message: '🌱 Seed level optimal'},
                    {type: 'success', message: '🎯 Reached waypoint successfully'},
                    {type: 'info', message: '📡 GPS signal strong'}
                ];
                const event = events[Math.floor(Math.random() * events.length)];
                this.showAlert(event.type, event.message, 2000);
            }
        }, 3000);

        // Update sync time
        setInterval(() => {
            this.updateLastSyncTime();
        }, 30000);
    }

    showInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('hidden');
        }
    }

    hideInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                this.showAlert('success', '🎉 Installing app...', 2000);
            } else {
                this.showAlert('info', '📱 Installation cancelled', 2000);
            }
            
            this.deferredPrompt = null;
            this.hideInstallBanner();
        } else {
            // Show manual installation instructions
            this.showAlert('info', '📱 To install: Open browser menu → "Add to Home Screen" or "Install App"', 5000);
        }
    }

    checkInstallPrompt() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            return; // Already installed
        }

        // Show install banner if install prompt is available
        if (this.deferredPrompt) {
            this.showInstallBanner();
        } else {
            // Show install button in settings
            const installBtn = document.getElementById('install-pwa-btn');
            if (installBtn) {
                installBtn.style.display = 'flex';
            }
        }
    }

    showAlert(type, message, duration = 3000) {
        const container = document.getElementById('alert-container');
        if (!container) return;
        
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        alert.setAttribute('role', 'alert');
        alert.setAttribute('aria-live', 'polite');
        
        container.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, duration);
        
        // Limit number of alerts
        while (container.children.length > 3) {
            container.removeChild(container.firstChild);
        }
    }

    hapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
}

// Initialize PWA app
document.addEventListener('DOMContentLoaded', () => {
    window.farmingApp = new FarmingRobotPWA();
    
    // Achievement notifications
    setTimeout(() => {
        window.farmingApp.showAlert('success', '🏆 Achievement: "Smart Farmer" - PWA installed!', 4000);
    }, 15000);
});

// Prevent zoom on double tap
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - event.target.lastTap <= 300) {
        event.preventDefault();
    }
    event.target.lastTap = now;
}, {passive: false});

// Handle gestures
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchstart', () => {}, {passive: true});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Handle app lifecycle
window.addEventListener('beforeunload', () => {
    // Save any pending data before closing
    console.log('App closing - saving state');
});

// Performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const loadTime = performance.now();
        console.log(`App loaded in ${Math.round(loadTime)}ms`);
    }
});

// Network status monitoring
if ('connection' in navigator) {
    const updateNetworkStatus = () => {
        const connection = navigator.connection;
        console.log(`Network: ${connection.effectiveType}, ${connection.downlink}Mbps`);
    };
    
    navigator.connection.addEventListener('change', updateNetworkStatus);
    updateNetworkStatus();
}