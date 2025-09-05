// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const agreeBtn = document.getElementById('agreeBtn');
    const declineBtn = document.getElementById('declineBtn');
    const mainContent = document.getElementById('mainContent');
    const videoContainer = document.getElementById('videoContainer');
    const targetVideo = document.getElementById('Video1');

    function showLoading(button) {
        const originalText = button.textContent;
        button.innerHTML = originalText + '<span class="loading"></span>';
        button.disabled = true;
        return originalText;
    }

    function requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    function playVideoWithSound(video) {
        video.muted = false;
        video.volume = 0.35; // Set volume to 35%

        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Video playing successfully');
                // Request fullscreen after video starts playing
                setTimeout(() => {
                    requestFullscreen(targetVideo);
                }, 500);
            }).catch(error => {
                console.log('Video autoplay failed:', error);
                // If autoplay fails, still show the container so user can click play
                videoContainer.classList.add('show');
            });
        }
    }

    function showVideo() {
        mainContent.style.display = 'none';
        
        // Show video container and attempt to play local video
        videoContainer.classList.add('show');
        targetVideo.load();
        targetVideo.addEventListener('loadeddata', () => {
            playVideoWithSound(targetVideo);
        });
        targetVideo.addEventListener('error', () => {
            console.log('Local video failed to load. The container will remain visible so the user can try to play it.');
        });
    }
    // Event Listeners
    agreeBtn.addEventListener('click', function() {
        const originalText = showLoading(this);
        
        // Add slight delay for dramatic effect
        setTimeout(() => {
            showVideo();
        }, 50);
    });

    if (!declineBtn) {
        console.warn('declineBtn not found in DOM');
    } else {
        declineBtn.addEventListener('click', function(event) {
            console.log('declineBtn clicked', {historyLength: window.history.length});
            // Defensive: prevent default if inside a form
            if (event && typeof event.preventDefault === 'function') event.preventDefault();

            if (window.history.length > 1) {
                console.log('Going back in history');
                window.history.back();
                setTimeout(() => {
                    alert('正在返回到Google主頁。');
                    window.location.href = 'https://google.com/';


                }, 100);
            } else {
                console.log('No history to go back to, redirecting to google.com');
                alert('正在返回到Google主頁。');
                window.location.href = 'https://google.com/';
            }
        });
    }

    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    function handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        
        if (!isFullscreen && videoContainer.classList.contains('show')) {
            // User exited fullscreen, try to re-enter after a short delay
            setTimeout(() => {
                if (videoContainer.classList.contains('show')) {
                    requestFullscreen(videoContainer);
                }
            }, 2000);
        }
    }

    // Prevent right-click context menu on video
    targetVideo.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Add konami code easter egg
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];

    document.addEventListener('keydown', function(event) {
        konamiCode.push(event.code);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.length === konamiSequence.length && 
            konamiCode.every((code, index) => code === konamiSequence[index])) {
            
            alert('看起來AI很想要這個彩蛋，所以我保留了這個彩蛋。')
            alert('🎉 Konami Code activated! You found the secret! 🎉');
            document.body.style.animation = 'spin 2s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
        }
    });
    
    function updateDeclineBtnTimeout(){
        let timeLeft = 10;
        const interval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(interval);
                declineBtn.textContent = '我不想看，帶我返回上一頁。(倒計時呢?)';
            } else {
                declineBtn.textContent = `我不想看，帶我返回上一頁。(${timeLeft})`;
                timeLeft--;
            }
        }, 1000);
    }

    updateDeclineBtnTimeout();

    console.warn("我看到你打開這個Debug Menu了 :/")
});
