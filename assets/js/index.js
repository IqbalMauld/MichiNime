// fetch('https://jsonplaceholder.typicode.com/posts', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify({
//     title: 'Halo Dunia',
//     body: 'Ini isi postingan',
//     userId: 1
//   })
// })
//   .then(response => response.json())
//   .then(data => {
//     console.log('Berhasil dikirim:', data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

const menu = document.getElementById('menu');
const sideBar = document.querySelector('.side');

menu.addEventListener('click', () => {
  sideBar.classList.toggle("active");

  // hapus svg lama
  const oldIcon = menu.querySelector('svg');
  if (oldIcon) oldIcon.remove();

  // buat i baru
  const newIcon = document.createElement('i');
  newIcon.setAttribute('data-feather', sideBar.classList.contains("active") ? 'x' : 'menu');
  menu.prepend(newIcon);

  feather.replace();
});


async function fetchNime() {
    const response = await fetch('https://animiru-be.vercel.app/api');
    const data = await response.json();
    return data.results.spotlights;
}

const container = document.querySelector('.slider-container');
const slider = document.getElementById('slider');

async function showNime() {
    const items = await fetchNime();
    items.forEach((item) => {
        let div = document.createElement('div');
        div.className = "slide";
        div.style.backgroundImage = `url("${item.poster}")`;
        div.innerHTML = `
          <h1>${item.title}</h1>
          <p>${item.description}</p>
        `;
        slider.appendChild(div);
    });
}

// Init slider setelah data siap
async function initSlider() {
    await showNime();

    const slidesOrig = Array.from(slider.children);
    const firstClone = slidesOrig[0].cloneNode(true);
    const lastClone  = slidesOrig[slidesOrig.length - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slider.firstChild);

    let currentIndex = 1;
    let isTransitioning = false;
    let isDragging = false;
    let startX = 0;

    function setPosition(animate = true) {
        const w = container.clientWidth;
        slider.style.transition = animate ? 'transform 0.45s ease' : 'none';
        slider.style.transform = `translateX(${-currentIndex * w}px)`;
    }

    setPosition(false);
    window.addEventListener('resize', () => setPosition(false));

    function changeSlide(dir) {
        if (isTransitioning) return;
        currentIndex += dir;
        setPosition(true);
    }

    slider.addEventListener('transitionstart', () => { isTransitioning = true; });
    slider.addEventListener('transitionend', () => {
        isTransitioning = false;
        const slidesNow = Array.from(slider.children);
        if (slidesNow[currentIndex].classList.contains('clone')) {
            slider.style.transition = 'none';
            if (currentIndex === 0) currentIndex = slidesNow.length - 2;
            else if (currentIndex === slidesNow.length - 1) currentIndex = 1;
            setPosition(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    slider.style.transition = 'transform 0.45s ease';
                });
            });
        }
    });

    container.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        slider.style.transition = 'none';
        container.setPointerCapture(e.pointerId);
        e.preventDefault()
        
      });
      
      container.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault()
        const dx = e.clientX - startX;
        const w = container.clientWidth;
        slider.style.transform = `translateX(${ -currentIndex * w + dx }px)`;
    });

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    const w = container.clientWidth;
    const threshold = w * 0.18;
    slider.style.transition = 'transform 0.45s ease';

    if (dx > threshold) {
        // Geser ke kiri (slide sebelumnya)
        currentIndex--;
    } else if (dx < -threshold) {
        // Geser ke kanan (slide berikutnya)
        currentIndex++;
    }
    setPosition(true);

    try { container.releasePointerCapture(e.pointerId); } catch {}
}


    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);
    container.addEventListener('pointerleave', endDrag);
}

initSlider();
