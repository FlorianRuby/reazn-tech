// Text Animation
document.addEventListener('DOMContentLoaded', function(event) {
    var dataText = ["Developer", "Photographer", "Video Editor", "Graphic Designer", "Music Nerd"];
    
    var displayDuration = 2000;
    var typingSpeed = 100;
    var deleteSpeed = 65;
    var pauseDuration = 500;

    function typeWriter(text, i, fnCallback) {
        if (i < text.length) {
            document.querySelector(".replacement").innerHTML = text.substring(0, i + 1) + '<span aria-hidden="true"></span>';
            setTimeout(function() {
                typeWriter(text, i + 1, fnCallback);
            }, typingSpeed);
        } else if (typeof fnCallback == 'function') {
            setTimeout(fnCallback, displayDuration);
        }
    }

    function deleteWriter(text, i, fnCallback) {
        if (i >= 0) {
            document.querySelector(".replacement").innerHTML = text.substring(0, i) + '<span aria-hidden="true"></span>';
            setTimeout(function() {
                deleteWriter(text, i - 1, fnCallback);
            }, deleteSpeed);
        } else if (typeof fnCallback == 'function') {
            setTimeout(fnCallback, pauseDuration);
        }
    }

    function StartTextAnimation(i) {
        if (typeof dataText[i] == 'undefined') {
            setTimeout(function() {
                StartTextAnimation(0);
            }, pauseDuration);
        } else {
            typeWriter(dataText[i], 0, function() {
                deleteWriter(dataText[i], dataText[i].length, function() {
                    StartTextAnimation(i + 1);
                });
            });
        }
    }

    // Initialize text animation
    StartTextAnimation(0);

    // Smooth Scrolling
    function smoothScroll(targetPosition, duration = 1000) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5 
                ? 4 * t * t * t 
                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + (distance * easeInOutCubic(progress)));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Handle all links and the button
    document.querySelectorAll('a[href^="#"], #scrollToSection2').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            
            let targetId;
            if (this.tagName === 'BUTTON') {
                targetId = 'marker-section2';
            } else {
                targetId = this.getAttribute('href').substring(1);
            }
            
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;
            
            const targetPosition = targetElement.offsetTop;
            smoothScroll(targetPosition);
        });
    });

    // Initialize Unified Cursor System
    if (!document.querySelector('.custom-cursor')) {
        const cursorWrapper = document.createElement('div');
        cursorWrapper.className = 'custom-cursor';
        
        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        
        const cursorOutline = document.createElement('div');
        cursorOutline.className = 'cursor-outline';
        
        cursorWrapper.appendChild(cursorDot);
        cursorWrapper.appendChild(cursorOutline);
        document.body.appendChild(cursorWrapper);
    }

    const follower = document.getElementById('follower');
    const overlay = document.getElementById('overlay');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const cursorWrapper = document.querySelector('.custom-cursor');

    let currentX = 0;
    let currentY = 0;
    let isTransitioning = false;
    let hoverTimeout;
    let isOverFooter = false;

    function updateCursorPosition(e) {
        currentX = e.clientX;
        currentY = e.clientY;

        // Update transformation origins
        [follower, overlay, cursorDot, cursorOutline].forEach(element => {
            if (element) {
                element.style.transformOrigin = `${currentX}px ${currentY}px`;
            }
        });

        // Update positions
        if (cursorDot) {
            cursorDot.style.transform = `translate(${currentX - 2.5}px, ${currentY - 2.5}px)`;
        }
        if (cursorOutline) {
            cursorOutline.style.transform = `translate(${currentX - 15}px, ${currentY - 15}px)`;
        }
        if (follower && !follower.classList.contains('shrinking')) {
            follower.style.transform = `translate(${currentX - follower.offsetWidth/2}px, ${currentY - follower.offsetHeight/2}px)`;
        }
    }

    function startHoverTransition() {
        if (isTransitioning) {
            clearTimeout(hoverTimeout);
        }
        isTransitioning = true;
        
        if (follower) {
            follower.classList.add('shrinking');
            follower.style.visibility = 'visible';
        }
        if (cursorWrapper) {
            cursorWrapper.classList.add('cursor-hover');
        }
        
        // Set visibility timeout for follower
        hoverTimeout = setTimeout(() => {
            if (follower) {
                follower.style.visibility = 'hidden';
            }
        }, 300);
    }

    function endHoverTransition() {
        // Don't end hover transition if over footer
        if (isOverFooter) return;

        if (isTransitioning) {
            clearTimeout(hoverTimeout);
        }
        isTransitioning = true;
        
        if (cursorWrapper) {
            cursorWrapper.classList.remove('cursor-hover');
        }
        
        // Reset transition state and restore follower
        hoverTimeout = setTimeout(() => {
            if (follower && !isOverFooter) {
                follower.style.visibility = 'visible';
                follower.classList.remove('shrinking');
                follower.style.transform = `translate(${currentX - follower.offsetWidth/2}px, ${currentY - follower.offsetHeight/2}px)`;
            }
            isTransitioning = false;
        }, 100);
    }

    // Add mousemove listener
    document.addEventListener('mousemove', updateCursorPosition);

    // Handle interactive elements except footer
    const interactiveElements = document.querySelectorAll('a, button, .about-button, header nav ul li, .independent-button, .discord-card, .portfolio-link');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', startHoverTransition);
        element.addEventListener('mouseleave', endHoverTransition);
    });

    // Special handling for footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.addEventListener('mouseenter', () => {
            isOverFooter = true;
            startHoverTransition();
        });
        
        footer.addEventListener('mouseleave', () => {
            isOverFooter = false;
            endHoverTransition();
        });
    }

    // Add transition end listeners
    if (follower) {
        follower.addEventListener('transitionend', () => {
            if (!follower.classList.contains('shrinking') && !isOverFooter) {
                isTransitioning = false;
            }
        });
    }

    // Initialize cursor visibility
    if (cursorWrapper) {
        cursorWrapper.classList.add('cursor-hover');
        setTimeout(() => {
            if (!isOverFooter) {
                cursorWrapper.classList.remove('cursor-hover');
            }
        }, 100);
    }
});


// Tag Cloud Setup
// Tag Cloud Setup
const radius = 200;
const images = [
    { src: 'assets/Icons-tagcloud/Icon_AE.svg.png', alt: 'After Effects' },
    { src: 'assets/Icons-tagcloud/Icon_CS.svg.png', alt: 'Creative Suite' },
    { src: 'assets/Icons-tagcloud/Icon_DavinciResolve.png', alt: 'DaVinci Resolve' },
    { src: 'assets/Icons-tagcloud/Icon_JS.svg.png', alt: 'JavaScript' },
    { src: 'assets/Icons-tagcloud/Icon_css3.svg.png', alt: 'CSS3' },
    { src: 'assets/Icons-tagcloud/Icon_html5.svg.png', alt: 'HTML5' },
    { src: 'assets/Icons-tagcloud/Icon_LRC.svg.png', alt: 'Lightroom' },
    { src: 'assets/Icons-tagcloud/Icon_ME.svg.png', alt: 'Media Encoder' },
    { src: 'assets/Icons-tagcloud/Icon_PR.svg.png', alt: 'Premiere Pro' },
    { src: 'assets/Icons-tagcloud/Icon_PS.svg.png', alt: 'Photoshop' },
    { src: 'assets/Icons-tagcloud/Icon_SQL.svg.png', alt: 'SQL' },
    { src: 'assets/Icons-tagcloud/Icon_VS.svg.png', alt: 'Visual Studio' },
    { src: 'assets/Icons-tagcloud/Icon_VSC.svg.png', alt: 'VS Code' }
];

class TagCloud {
    constructor(container) {
        this.container = container;
        this.items = [];
        this.rotation = { x: 0, y: 0 };
        this.animationFrame = null;
        this.rotationSpeed = 0.006;
        this.setup();
    }

    setup() {
        images.forEach((image, i) => {
            const points = images.length;
            const phi = Math.acos(-1 + (2 * i) / points);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            const item = document.createElement('div');
            item.className = 'tagcloud--item';
            
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.title = image.alt;
            
            if (image.src.includes('Icon_SQL.svg.png')) {
                img.classList.add('sql-icon');
            }
            
            item.appendChild(img);
            this.container.appendChild(item);
            
            this.items.push({
                element: item,
                x, y, z
            });
        });

        this.animate();
    }

    animate() {
        this.rotation.x += this.rotationSpeed;
        this.rotation.y += this.rotationSpeed;

        const sinX = Math.sin(this.rotation.x);
        const cosX = Math.cos(this.rotation.x);
        const sinY = Math.sin(this.rotation.y);
        const cosY = Math.cos(this.rotation.y);

        this.items.forEach(item => {
            const { x, y, z } = item;
            
            const newX = cosY * x + sinY * z;
            const newY = sinX * sinY * x + cosX * y - sinX * cosY * z;
            const newZ = -cosX * sinY * x + sinX * y + cosX * cosY * z;

            const translate = `translate(-50%, -50%) translate3d(${newX}px, ${newY}px, ${newZ}px)`;

            item.element.style.transform = translate;
            item.element.style.opacity = 1;
            item.element.style.zIndex = Math.floor((newZ + radius) / (2 * radius) * 1000);
        });

        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize TagCloud when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('tagcloud');
    if (container) {
        new TagCloud(container);
    }
});

// Discord integration
const DISCORD_ID = '699913103378350122';
const SONG_NAME_LIMIT = 40;
const ARTIST_NAME_LIMIT = 26;

function truncateText(text, limit) {
    if (text.length > limit) {
        return text.substring(0, limit - 3) + '...';
    }
    return text;
}

function updateDiscordStatus() {
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) return;
            
            const status = data.data;
            const discordCard = document.getElementById('discord-status');
            
            // Update avatar and status
            discordCard.querySelector('.avatar').src = 
                `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${status.discord_user.avatar}`;
            
            discordCard.querySelector('.status-indicator').className = 
                `status-indicator status-${status.discord_status}`;
            
            // Update username
            discordCard.querySelector('.username').textContent = status.discord_user.username;
            
            // Update spotify status
            const activityStatus = discordCard.querySelector('.activity-status');
            const albumArt = discordCard.querySelector('.spotify-album-art');
            
            if (status.listening_to_spotify) {
                const truncatedSong = truncateText(status.spotify.song, SONG_NAME_LIMIT);
                const truncatedArtist = truncateText(status.spotify.artist, ARTIST_NAME_LIMIT);
                
                activityStatus.innerHTML = `<span class="listening-text">Listening to</span> ${truncatedSong}<br>by ${truncatedArtist}`;
                albumArt.src = status.spotify.album_art_url;
                albumArt.style.display = 'block';
            } else {
                // Check for custom status
                const customActivity = status.activities.find(activity => activity.type === 4);
                if (customActivity && customActivity.state) {
                    let statusText = customActivity.state;
                    if (customActivity.emoji) {
                        const emojiImg = customActivity.emoji.id ? 
                            `<img src="https://cdn.discordapp.com/emojis/${customActivity.emoji.id}.png" class="status-emoji" alt="emoji">` :
                            customActivity.emoji.name;
                        statusText = `${emojiImg} ${statusText}`;
                    }
                    activityStatus.innerHTML = statusText;
                    albumArt.style.display = 'none';
                } else {
                    activityStatus.textContent = '';
                    albumArt.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching Discord status:', error);
        });
}

// Initialize Discord status and set up auto-update
updateDiscordStatus();
setInterval(updateDiscordStatus, 15000);

// Contact links animation
document.addEventListener('DOMContentLoaded', function() {
    const options = {
        threshold: 0.9
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const contactLinks = document.querySelectorAll('.contact-link');
            
            if (entry.isIntersecting) {
                contactLinks.forEach(link => {
                    link.classList.remove('line-out');
                    link.classList.add('line-in');
                });
            } else {
                contactLinks.forEach(link => {
                    link.classList.remove('line-in');
                    link.classList.add('line-out');
                });
            }
        });
    }, options);

    const section4 = document.querySelector('.section-4');
    if (section4) {
        observer.observe(section4);
    }
});

// Project preview functionality
document.addEventListener('DOMContentLoaded', function() {
    const projects = document.querySelectorAll('.project');
    const previewImage = document.getElementById('preview-image');
    const previewWindow = document.querySelector('.preview-window');
    const follower = document.getElementById('follower');
    const overlay = document.getElementById('overlay');

    if (!projects.length || !previewImage || !previewWindow) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const ease = 0.15;

    function animate() {
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;

        currentX += dx * ease;
        currentY += dy * ease;

        if (previewImage.classList.contains('visible')) {
            previewImage.style.left = `${currentX}px`;
            previewImage.style.top = `${currentY}px`;
        }

        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Handle project hover
    projects.forEach((project) => {
        project.addEventListener('mouseenter', () => {
            const imagePath = project.getAttribute('data-preview');
            previewImage.src = imagePath;
            previewImage.classList.add('visible');
            document.body.classList.add('hide-cursor');
            
            // Add class to hide follower
            if (follower) {
                follower.classList.add('preview-visible');
            }
        });

        project.addEventListener('mouseleave', () => {
            previewImage.classList.remove('visible');
            document.body.classList.remove('hide-cursor');
            
            // Remove class to show follower
            if (follower) {
                follower.classList.remove('preview-visible');
            }
        });
    });

    animate();
});

// Remove the separate project preview functionality and integrate it with the cursor system
document.addEventListener('DOMContentLoaded', function() {
    // ... existing cursor variables ...
    const projects = document.querySelectorAll('.project');
    const previewImage = document.getElementById('preview-image');
    const previewWindow = document.querySelector('.preview-window');

    if (!projects.length || !previewImage || !previewWindow) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const ease = 0.15;

    function animate() {
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;

        currentX += dx * ease;
        currentY += dy * ease;

        if (previewImage.classList.contains('visible')) {
            previewImage.style.left = `${currentX}px`;
            previewImage.style.top = `${currentY}px`;
        }

        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', updateCursorPosition);

    // Add projects to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .about-button, header nav ul li, .independent-button, .discord-card, .portfolio-link, .project');

    interactiveElements.forEach(element => {
        if (element.classList.contains('project')) {
            // Special handling for projects
            element.addEventListener('mouseenter', () => {
                startHoverTransition();
                const imagePath = element.getAttribute('data-preview');
                previewImage.src = imagePath;
                previewImage.classList.add('visible');
                document.body.classList.add('hide-cursor');
            });

            element.addEventListener('mouseleave', () => {
                endHoverTransition();
                previewImage.classList.remove('visible');
                document.body.classList.remove('hide-cursor');
            });
        } else {
            // Normal interactive element handling
            element.addEventListener('mouseenter', startHoverTransition);
            element.addEventListener('mouseleave', endHoverTransition);
        }
    });

    animate();
});