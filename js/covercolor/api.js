const coverColor = () => {
    const path = document.getElementById("post-cover")?.src;
    if (path) {
        handleApiColor(path);
    } else {
        document.documentElement.style.setProperty('--efu-main', 'var(--efu-theme)');
        document.documentElement.style.setProperty('--efu-main-op', 'var(--efu-theme-op)');
        document.documentElement.style.setProperty('--efu-main-op-deep', 'var(--efu-theme-op-deep)');
        document.documentElement.style.setProperty('--efu-main-none', 'var(--efu-theme-none)');
        initThemeColor()
    }
}

function handleApiColor(path) {
    const cacheGroup = JSON.parse(localStorage.getItem('Solitude')) || {};
    if (cacheGroup.postcolor && cacheGroup.postcolor[path]) {
        const color = cacheGroup.postcolor[path].value;
        const [r, g, b] = color.match(/\w\w/g).map(x => parseInt(x, 16));
        setThemeColors(color, r, g, b);
    } else {
        img2color(path);
    }
}

function img2color(src) {
    const apiUrl = coverColorConfig.api + encodeURIComponent(src);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const color = data.RGB;
            const [r, g, b] = color.match(/\w\w/g).map(x => parseInt(x, 16));
            setThemeColors(color, r, g, b);
            const expirationTime = Date.now() + coverColorConfig.time;
            const cacheGroup = JSON.parse(localStorage.getItem('Solitude')) || {};
            cacheGroup.postcolor = cacheGroup.postcolor || {};
            cacheGroup.postcolor[src] = {value: color, expiration: expirationTime};
            localStorage.setItem('Solitude', JSON.stringify(cacheGroup));
        })
        .catch(error => {
            console.error('请检查API是否正常！\n' + error);
        });
}

function setThemeColors(value, r = null, g = null, b = null) {
    if (value) {
        document.documentElement.style.setProperty('--efu-main', value);
        document.documentElement.style.setProperty('--efu-main-op', value + '23');
        document.documentElement.style.setProperty('--efu-main-op-deep', value + 'dd');
        document.documentElement.style.setProperty('--efu-main-none', value + '00');

        if (r && g && b) {
            let brightness = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
            if (brightness < 125) {
                let cardContents = document.getElementsByClassName('card-content');
                for (let i = 0; i < cardContents.length; i++) {
                    cardContents[i].style.setProperty('--efu-card-bg', 'var(--efu-white)');
                }

                let authorInfo = document.getElementsByClassName('author-info__sayhi');
                for (let i = 0; i < authorInfo.length; i++) {
                    authorInfo[i].style.setProperty('background', 'var(--efu-white-op)');
                    authorInfo[i].style.setProperty('color', 'var(--efu-white)');
                }
            }
        }

        document.getElementById("coverdiv").classList.add("loaded");
        initThemeColor();
    } else {
        document.documentElement.style.setProperty('--efu-main', 'var(--efu-theme)');
        document.documentElement.style.setProperty('--efu-main-op', 'var(--efu-theme-op)');
        document.documentElement.style.setProperty('--efu-main-op-deep', 'var(--efu-theme-op-deep)');
        document.documentElement.style.setProperty('--efu-main-none', 'var(--efu-theme-none)');
        initThemeColor();
    }
}

function initThemeColor() {
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    let themeColor;
    if (currentTop > 0) {
        themeColor = getComputedStyle(document.documentElement).getPropertyValue('--efu-card-bg');
    } else if (PAGE_CONFIG.is_post) {
        themeColor = getComputedStyle(document.documentElement).getPropertyValue('--efu-main');
    } else {
        themeColor = getComputedStyle(document.documentElement).getPropertyValue('--efu-background');
    }
    changeThemeColor(themeColor);
}

function changeThemeColor(color) {
    if (null !== document.querySelector('meta[name="theme-color"]') && (document.querySelector('meta[name="theme-color"]').setAttribute("content", color),
        document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').setAttribute("content", color)),
        window.matchMedia("(display-mode: standalone)").matches) {
        const t = document.body;
        t ? t.style.backgroundColor = color : console.error("document.body不存在")
    }
}