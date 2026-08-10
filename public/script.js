document.addEventListener('DOMContentLoaded', () => {
    const bgLayer = document.querySelector('.layer-bg');
    const midLayer = document.querySelector('.layer-mid');
    const fgLayer = document.querySelector('.layer-fg');
    const enterText = document.getElementById('enter-text');

    let isPreloaded = false;

    // Listen for preload message from the hidden iframe
    window.addEventListener('message', (event) => {
        if (event.data === 'POND_LOADED') {
            console.log("Pond assets fully preloaded!");
            isPreloaded = true;
        }
    });

    // Basic Parallax Scroll Logic
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Move layers at different speeds to create depth
        if (bgLayer) bgLayer.style.transform = `translateY(${scrollY * 0.1}px)`;
        if (midLayer) midLayer.style.transform = `translateY(${scrollY * 0.3}px)`;
        if (fgLayer) fgLayer.style.transform = `translateY(${scrollY * 0.6}px)`;

        // Slightly move the text as well, but stop when zoom is active
        if (enterText && !enterText.classList.contains('zoom-in-active')) {
            enterText.style.transform = `translateY(${scrollY * -0.2}px)`;
        }
    });

    // Click behavior for 'Malhar Archives' text
    if (enterText) {
        enterText.addEventListener('click', () => {
            // 1. Start zoom animation
            enterText.classList.add('zoom-in-active');

            // 2. Start 3 second timer
            const TIMEOUT_MS = 3000;
            const ANIMATION_DURATION_MS = 1500; // time needed for zoom effect to look good
            const clickTime = Date.now();

            const intervalId = setInterval(() => {
                const elapsed = Date.now() - clickTime;

                // If preloaded and animation has played sufficiently
                if (isPreloaded && elapsed >= ANIMATION_DURATION_MS) {
                    clearInterval(intervalId);
                    window.location.href = '/pond?start=puddle';
                }
                // If timeout reached
                else if (elapsed >= TIMEOUT_MS) {
                    clearInterval(intervalId);
                    if (isPreloaded) {
                        window.location.href = '/pond?start=puddle';
                    } else {
                        // Not loaded by 3 seconds, fallback
                        window.location.href = '/pond?start=puddle';
                    }
                }
            }, 100);
        });
    }
});

const parallax_el = document.querySelectorAll(".parallax");
let xValue = 0,
    yValue = 0;

let rotateDegree = 0;

function update(cursorPosition) {
    parallax_el.forEach((el) => {
        let speedx = el.dataset.speedx;
        let speedy = el.dataset.speedy;
        let speedz = el.dataset.speedz;
        let rotateSpeed = el.dataset.rotation;

        let isInLeft =
            parseFloat(getComputedStyle(el).left) < window.innerWidth / 2 ? 1 : -1;
        let zValue =
            (cursorPosition - parseFloat(getComputedStyle(el).left)) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${zValue * speedz
            }px) rotateY(${rotateDegree * rotateSpeed}deg) translateX(calc(-50% + ${-xValue * speedx
            }px)) translateY(calc(-50% + ${yValue * speedy})px)`;
    });
}
update(0);
window.addEventListener("mousemove", (e) => {
    if (DocumentTimeline.isActive())
        return;
    xValue = e.clientX - window.innerWidth / 2;
    yValue = e.clientY - window.innerHeight / 2;
    rotateDegree = (xValue / (window.innerWidth / 2)) * 20;
    update(e.clientX);
});
//GSAP Animation
let timeline = gsap.timeline();

Array.from(parallax_el)
    .filter((el) => !el.classList.contains("text"))
    .forEach((el) => {
        timeline.from(
            el,
            {
                top: `${el.offsetHeight / 2 + +el.dataset.distance}px`,
                duration: 3.5,
                ease: "power3.out"
            },
            "1"
        );
    });

timeline.from('.title-text', {
    y: window.innerHeight - document.querySelector('.title-text').getBoundingClientRect().top + 200,
    duration: 2,
}, "2"
)
    .from(
        ".text h2",
        {
            y: -150,
            opacity: 0,
            duration: 1.5,
        }, "3"
    )
    .from(".hide", {
        opacity: 0,
        duration: 1.5,
    }, "3");
