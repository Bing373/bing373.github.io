/*// 置顶悬浮
window.onscroll = function() {stickyFunction()};

var navigationBar = document.getElementById("navigationBar");
var box2OffsetTop = document.getElementsByClassName("box2")[0].offsetTop;
var show1 = document.getElementById("show1");

function stickyFunction() {
    if (window.pageYOffset >= box2OffsetTop) {
        navigationBar.classList.add("sticky");
        show1.classList.add("box3-fix");
    } else {
        navigationBar.classList.remove("sticky");
        show1.classList.remove("box3-fix");
    }
}*/

// 滚动至顶部
function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    section.scrollIntoView({behavior: 'smooth', block: 'start'});
    // section.style.scrollMarginTop = '12000px';
    console.log("aaa")
}

function updateTime() {
    var startTime = new Date("2023-11-01T00:00:00"); // 指定的开始时间
    var currentTime = new Date();
    var diff = Math.floor((currentTime - startTime) / 1000); // 时间差，单位为秒

    var years = Math.floor(diff / (365 * 24 * 60 * 60));
    diff -= years * 365 * 24 * 60 * 60;
    var months = Math.floor(diff / (30 * 24 * 60 * 60));
    diff -= months * 30 * 24 * 60 * 60;
    var days = Math.floor(diff / (24 * 60 * 60));
    diff -= days * 24 * 60 * 60;
    var hours = Math.floor(diff / (60 * 60));
    diff -= hours * 60 * 60;
    var minutes = Math.floor(diff / 60);
    var seconds = Math.floor(diff % 60);

    document.getElementById("blog_time").innerHTML = "博客已经运行了：" + "<br/>" +
        years +
        "年 " +
        months +
        "月 " +
        days +
        "天 " +
        hours +
        "小时 " +
        minutes +
        "分钟 " +
        seconds +
        "秒";
}

setInterval(updateTime, 1000);

function rotateImageOnHover() {
    var rotatingImage = document.querySelector('.rotating-img');

    rotatingImage.addEventListener('mouseout', function () {
        rotatingImage.style.transform = 'rotate(0deg)';
    });

    rotatingImage.addEventListener('mouseover', function () {
        rotatingImage.style.transform = 'rotate(360deg)';
    });
}

rotateImageOnHover();

// 禁止屏幕按比例缩放
function disableZoom() {
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, {passive: false});
}

// 初始化时调用禁止屏幕按比例缩放函数
disableZoom();

// 音乐播放器
class MusicPlayer {
    constructor(
        data = {
            // 歌曲信息在这里修改
            songObjArr: [
                {
                    title: "I miss you, I’m sorry",
                    author: "Gracie Abrams",
                    imgSrc: "./public/images/01.jpg",
                    url: "./public/audios/01.m4a",
                },
            ],
            currentIndex: 0,
        }
    ) {
        // 与 _renderFrame 相关变量
        this._startTime = null;
        this._isRunTimeArr = new Array(2).fill(false);
        this._requestID = null;

        this._songObjArr = data.songObjArr;
        this.__currentIndex = data.currentIndex;
        // 用户是否进行了播放操作
        this._isUserPlay = false;

        this._mImgBoxDom = document.querySelector(".music-box");

        // 播放器单体
        this._musicPlayerEntity = new Entity();

        // 音乐图片组件
        this._musicPlayerEntity.addComp(
            new MusicImgComp({
                imgSrcArr: Array.from(this._songObjArr, (item) => item.imgSrc),
                currentImgIndex: this._currentIndex,
            })
        );

        // 音乐控制组件
        this._musicPlayerEntity.addComp(
            new MusicControlComp({
                onClickMPreviousBtn: () => {
                    this._currentIndex = this._currentIndex - 1;
                },
                onClickMPlayBtn: () => {
                    if (this._startTime === null && this._musicPlayerEntity.getComp("musicComp").isCanPlay) {
                        this._musicPlayerEntity.getComp("musicComp").isPlay = !this._musicPlayerEntity.getComp("musicComp").isPlay;
                        this._isUserPlay = this._musicPlayerEntity.getComp("musicComp").isPlay;
                    }
                },
                onClickMNextBtn: () => {
                    this._currentIndex = this._currentIndex + 1;
                },
                onClickMProgressBar: (event) => {
                    if (!this._musicPlayerEntity.getComp("musicComp").isCanPlay) {
                        return;
                    }
                    if (event.target === this._musicPlayerEntity.getComp("musicControlComp").mProgressBtnDom) {
                        return;
                    }
                    const time = this._getXTime(event.offsetX);
                    this._musicPlayerEntity.getComp("musicControlComp").currentTime = time;
                    this._musicPlayerEntity.getComp("musicComp").currentTime = time;
                },
                onMousedownMProgressBtn: (event) => {
                    if (!this._musicPlayerEntity.getComp("musicComp").isCanPlay) {
                        return;
                    }
                    this._musicPlayerEntity.getComp("musicControlComp").isSetProgressBar = true;
                    const x = event.clientX;
                    let time = this._musicPlayerEntity.getComp("musicComp").currentTime;
                    const px = this._getTimeX(time);
                    let currentX = 0;

                    // 鼠标移动事件回调
                    const onMImgBoxMousemove = (event) => {
                        const bx = event.clientX;
                        const betweenNum = bx - x;
                        currentX = px + betweenNum;
                        if (currentX < 0) {
                            currentX = 0;
                        } else if (currentX > this._musicPlayerEntity.getComp("musicControlComp").totalProgressW) {
                            currentX = this._musicPlayerEntity.getComp("musicControlComp").totalProgressW;
                        }
                        time = this._getXTime(currentX);
                        this._musicPlayerEntity.getComp("musicControlComp").currentTime = time;
                    }
                    this._mImgBoxDom.addEventListener("mousemove", onMImgBoxMousemove);

                    // 操作完成回调
                    const removeCB = () => {
                        this._mImgBoxDom.removeEventListener("mousemove", onMImgBoxMousemove);
                        this._mImgBoxDom.removeEventListener("mouseup", removeCB);
                        this._mImgBoxDom.removeEventListener("mouseleave", removeCB);
                        this._musicPlayerEntity.getComp("musicComp").currentTime = time;
                        this._musicPlayerEntity.getComp("musicControlComp").isSetProgressBar = false;
                    }

                    this._mImgBoxDom.addEventListener("mouseup", removeCB);
                    this._mImgBoxDom.addEventListener("mouseleave", removeCB);
                }
            })
        );

        // 音乐描述组件
        this._musicPlayerEntity.addComp(
            new MusicDescComp({
                mDescArr: Array.from(this._songObjArr, item => {
                    return {title: item.title, author: item.author}
                }),
                currentDescIndex: this._currentIndex
            })
        )

        // 音乐组件
        this._musicPlayerEntity.addComp(
            new MusicComp({
                mUrlArr: Array.from(this._songObjArr, item => item.url),
                currentUrlIndex: this._currentIndex,
                onCanplay: () => {
                    this._musicPlayerEntity.getComp("musicComp").isCanPlay = true;
                    this._musicPlayerEntity.getComp("musicControlComp").totalTime = this._musicPlayerEntity.getComp("musicComp").totalTime;

                    if (this._isUserPlay) {
                        this._musicPlayerEntity.getComp("musicComp").isPlay = true;
                    }
                },

                onEnded: () => {
                    this._currentIndex = this._currentIndex + 1;
                },
                onTimeupdate: () => {
                    if (this._musicPlayerEntity.getComp("musicControlComp").isSetProgressBar) {
                        return;
                    }
                    this._musicPlayerEntity.getComp("musicControlComp").currentTime = this._musicPlayerEntity.getComp("musicComp").currentTime;
                    this._musicPlayerEntity.getComp("musicControlComp").loadTime = this._musicPlayerEntity.getComp("musicComp").loadTime;
                }
            })
        )
    }

    set _currentIndex(value) {
        if (this._startTime === null) {
            this._musicPlayerEntity.getComp("musicComp").isPlay = false;
            this._musicPlayerEntity.getComp("musicComp").isCanPlay = false;
            this._musicPlayerEntity.getComp("musicImgComp").isAnim = true;
            this._musicPlayerEntity.getComp("musicImgComp").switchDir = value - this._currentIndex;
            this._musicPlayerEntity.getComp("musicDescComp").isAnim = true;
            this._musicPlayerEntity.getComp("musicDescComp").switchDir = value - this._currentIndex;
            this._requestID = requestAnimationFrame(this._renderFrame.bind(this));
            let v =
                value < 0
                    ? this._songObjArr.length - 1
                    : value >= this._songObjArr.length
                        ? 0
                        : value;
            this.__currentIndex = v;
        }
    }

    get _currentIndex() {
        return this.__currentIndex;
    }

    // 根据相对于进度条的 x 坐标求出时间
    _getXTime(value) {
        return Math.floor(value * this._musicPlayerEntity.getComp("musicComp").totalTime / this._musicPlayerEntity.getComp("musicControlComp").totalProgressW);
    }

    // 根据时间求出相对于进度条的 x 坐标
    _getTimeX(time) {
        return time * this._musicPlayerEntity.getComp("musicControlComp").totalProgressW / this._musicPlayerEntity.getComp("musicComp").totalTime;
    }

    _renderFrame(timestamp) {
        this._requestID = requestAnimationFrame(this._renderFrame.bind(this));

        if (this._startTime === null) {
            this._startTime = timestamp;
        }

        if (timestamp >= this._startTime + 1000) {
            // 图片动画结束
            this._musicPlayerEntity.getComp("musicImgComp").isAnim = false;
            this._musicPlayerEntity.getComp("musicImgComp").currentImgIndex = this._currentIndex;

            // 描述动画结束
            this._musicPlayerEntity.getComp("musicDescComp").isAnim = false;

            // 结束更新
            cancelAnimationFrame(this._requestID);
            this._isRunTimeArr = this._isRunTimeArr.fill(false);
            this._startTime = null;
            return;
        }

        if (timestamp >= this._startTime + 500 && !this._isRunTimeArr[1]) {
            this._isRunTimeArr[1] = true;
            this._musicPlayerEntity.getComp("musicDescComp").currentDescIndex = this._currentIndex;

            // 切换音乐
            this._musicPlayerEntity.getComp("musicComp").currentUrlIndex = this._currentIndex;
        }
    }
}

// 单体
class Entity {
    constructor() {
        this._compMap = new Map();
    }

    addComp(comp) {
        this._compMap.set(comp.name, comp);
    }

    getComp(compName) {
        return this._compMap.get(compName);
    }
}

// 音乐图片
class MusicImgComp {
    constructor(data) {
        this.name = "musicImgComp";
        this._imgSrcArr = data.imgSrcArr;
        this._currentImgIndex = data.currentImgIndex;
        this._mImgContentDom = document.querySelector(".m-img-content");

        // 新建图片节点
        this._mImgDomArr = Array.from(
            new Array(this._imgSrcArr.length + 2),
            (item, index) => {
                const dom = document.createElement("img");
                switch (index) {
                    case 0:
                        dom.src = this._imgSrcArr[this._imgSrcArr.length - 1];
                        break;
                    case this._imgSrcArr.length + 1:
                        dom.src = this._imgSrcArr[0];
                        break;
                    default:
                        dom.src = this._imgSrcArr[index - 1];
                        break;
                }
                return dom;
            }
        );
        this._mImgContentDom.append(...this._mImgDomArr);

        this._switchDir = 1;
        this._isAnim = false;
        this.currentImgIndex = this._currentImgIndex;
    }

    set switchDir(value) {
        this._mImgContentDom.style.transform = `translateY(${-100 * (this._currentImgIndex + value + 1)
        }%)`;
        this._switchDir = value;
    }

    set currentImgIndex(value) {
        this._mImgContentDom.style.transform = `translateY(${-100 * (value + 1)}%)`;
        this._currentImgIndex = value;
    }

    set isAnim(value) {
        if (value) {
            this._mImgDomArr.forEach((item) => {
                item.classList.add("anim");
            });
            this._mImgContentDom.classList.add("tran");
        } else {
            this._mImgDomArr.forEach((item) => {
                item.classList.remove("anim");
            });
            this._mImgContentDom.classList.remove("tran");
        }
        this._isAnim = value;
    }
}

// 音乐控制
class MusicControlComp {
    constructor(data) {
        this.name = "musicControlComp";
        this._mPreviousBtnDom = document.querySelector(".m-previous-btn");
        this._mPlayBtnDom = document.querySelector(".m-play-btn");
        this._mNextBtnDom = document.querySelector(".m-next-btn");
        this._mPlayBtnSvgDom = document.querySelector(".m-play-btn svg");
        this._mProgressBarDom = document.querySelector(".m-progress-bar");
        this._mTotalTimeDom = document.querySelector(".m-total-time");
        this._mCurrentTimeDom = document.querySelector(".m-current-time");
        this._mProgressMainDom = document.querySelector(".m-progress-main");
        this.mProgressBtnDom = document.querySelector(".m-progress-btn");
        this._mProgressLoadDom = document.querySelector(".m-progress-load");

        this._isPlay = false;
        this._totalTime = 0;
        // 是否在设置进度条
        this.isSetProgressBar = false;
        this.totalProgressW = this._mProgressBarDom.clientWidth;

        this._mPreviousBtnDom.addEventListener("click", data.onClickMPreviousBtn);
        this._mPlayBtnDom.addEventListener("click", data.onClickMPlayBtn);
        this._mNextBtnDom.addEventListener("click", data.onClickMNextBtn);
        // 音乐进度条点击事件
        this._mProgressBarDom.addEventListener("click", data.onClickMProgressBar);
        this.mProgressBtnDom.addEventListener("mousedown", data.onMousedownMProgressBtn);

        this.currentTime = 0;
        this.loadTime = 0;
    }

    set isPlay(value) {
        if (value) {
            this._mPlayBtnSvgDom.innerHTML = `<use href = "#icon-24gf-pause2"></use>`;
        } else {
            this._mPlayBtnSvgDom.innerHTML = `<use href = "#icon-bofang"></use>`;
        }
        this._isPlay = value;
    }

    get isPlay() {
        return this._isPlay;
    }

    set totalTime(value) {
        this._mTotalTimeDom.textContent = this._getTimeDateStr(value);
        this._totalTime = value;
    }

    set currentTime(value) {
        if (this._totalTime === 0) {
            this._mProgressMainDom.style.width = "0%";
        }
        this._mProgressMainDom.style.width = `${value * 100 / this._totalTime}%`;
        this._mCurrentTimeDom.textContent = this._getTimeDateStr(value);
    }

    set loadTime(value) {
        if (this._totalTime === 0) {
            this._mProgressLoadDom.style.width = "0%";
        }
        this._mProgressLoadDom.style.width = `${value * 100 / this._totalTime}%`;
    }

    // 返回时间格式的字符串
    _getTimeDateStr(time) {
        if (!time) {
            return "00 : 00";
        }
        const minute = parseInt(time / 60);
        const second = time % 60;
        return `${minute < 10 ? "0" + minute : "" + minute} : ${second < 10 ? "0" + second : "" + second}`;
    }
}

// 音乐描述
class MusicDescComp {
    constructor(data) {
        this.name = "musicDescComp";
        this._mDescArr = data.mDescArr;
        this._currentDescIndex = data.currentDescIndex;
        this._mDescArticleDom = document.querySelector(".m-description-content>article");
        this._mTitleDom = document.querySelector(".m-title");
        this._mAuthorDom = document.querySelector(".m-author");

        this._switchDir = 1;
        this._isAnim = false;
        this.currentDescIndex = this._currentDescIndex;
    }

    set switchDir(value) {
        this._mDescArticleDom.style.setProperty("--transform-translateY", `translateY(${value * -20}%)`);
        this._switchDir = value;
    }

    set currentDescIndex(value) {
        this._mTitleDom.textContent = this._mDescArr[value].title;
        this._mAuthorDom.textContent = this._mDescArr[value].author;
        this._currentDescIndex = value;
    }

    set isAnim(value) {
        if (value) {
            this._mDescArticleDom.classList.add("anim");
        } else {
            this._mDescArticleDom.classList.remove("anim");
        }
        this._isAnim = value;
    }
}

// 音乐
class MusicComp {
    constructor(data) {
        this.name = "musicComp";
        this._mUrlArr = data.mUrlArr;
        this._currentUrlIndex = data.currentUrlIndex;
        this._audioDom = document.createElement("audio");

        this._isPlay = false;
        this._isCanPlay = false;

        this._audioDom.addEventListener("canplay", data.onCanplay);
        this._audioDom.addEventListener("play", data.onPlay);
        this._audioDom.addEventListener("pause", data.onPause);
        this._audioDom.addEventListener("ended", data.onEnded);
        this._audioDom.addEventListener("timeupdate", data.onTimeupdate);

        this.currentUrlIndex = this._currentUrlIndex;
    }

    set currentUrlIndex(value) {
        this._audioDom.src = this._mUrlArr[value];
        this._currentUrlIndex = value;
    }

    set isPlay(value) {
        if (value) {
            this._audioDom.play();
        } else {
            this._audioDom.pause();
        }
        this._isPlay = value;
    }

    get isPlay() {
        return this._isPlay;
    }

    // 音乐总的时间
    get totalTime() {
        return Math.floor(this._audioDom.duration);
    }

    set currentTime(value) {
        this._audioDom.currentTime = value;
    }

    get currentTime() {
        return Math.floor(this._audioDom.currentTime);
    }

    get loadTime() {
        const timeRanges = this._audioDom.buffered;
        let time = 0;
        if (timeRanges.length === 0) {
            time = 0;
        } else {
            time = Math.floor(timeRanges.end(timeRanges.length - 1));
        }
        return time;
    }

    set isCanPlay(value) {
        this._isCanPlay = value;
    }

    get isCanPlay() {
        return this._isCanPlay;
    }
}


new MusicPlayer();

// 定义滚动函数
function applyScrollAnimation(element) {
    // 获取元素内的文本内容
    const text = element.innerText;

    // 创建一个新的span元素来包裹文本内容
    const span = document.createElement('span');
    span.innerText = text;

    // 将span元素添加到元素中
    element.innerHTML = '';
    element.appendChild(span);

    // 判断文本是否超出元素宽度
    if (span.offsetWidth > element.offsetWidth) {
        // 设置span元素的样式，使其实现文字滚动效果
        span.style.display = 'inline-block';
        span.style.animation = `scroll-text ${span.offsetWidth / 50}s linear infinite`;

        // 设置滚动的距离
        const scrollDistance = span.offsetWidth - element.offsetWidth;

        // 设置滚动的速度
        const scrollSpeed = span.offsetWidth / 100; // 调整这个值来改变滚动速度

        // 设置动画的关键帧
        const keyframes = `@keyframes scroll-text {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-${scrollDistance}px);
      }
    }`;

        // 设置动画的持续时间
        span.style.animation = `scroll-text ${scrollSpeed}s linear infinite`;

        // 创建style标签，并将关键帧添加到其中
        const styleTag = document.createElement('style');
        styleTag.appendChild(document.createTextNode(keyframes));

        // 将style标签添加到head元素中
        document.head.appendChild(styleTag);

        // 监听动画结束事件，当滚动距离超出实际文本距离时，重新滚动
        span.addEventListener('animationiteration', () => {
            if (span.offsetWidth < element.offsetWidth || Math.abs(parseInt(span.style.transform)) >= scrollDistance) {
                span.style.transform = 'translateX(0)';
            }
        });
    }
}

// 获取需要滚动播放的div元素
const titleContainer = document.getElementById('m-title');
applyScrollAnimation(titleContainer);

// 获取需要滚动播放的div元素
const auContainer = document.getElementById('m-author');
applyScrollAnimation(auContainer);

// 按钮替换
const playBtn = document.getElementById('m-play-btn');

let isClicked = false;

playBtn.addEventListener('click', function() {
    if (!isClicked) {
        playBtn.innerHTML = '<svg t="1699100306101" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2494" width="48" height="48"><path d="M928 335.1c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1-55.3-23.4-114-35.2-174.5-35.2S395.7 73.1 340.4 96.5c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.2 174.5c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5S951.3 390.4 928 335.1zM514.9 877.9c-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3 203.1 0 368.3 165.2 368.3 368.3 0 203-165.2 368.3-368.3 368.3z" p-id="2495"></path><path d="M413.8 316.6c-22.1 0-40 17.9-40 40v306c0 22.1 17.9 40 40 40s40-17.9 40-40v-306c0-22.1-17.9-40-40-40zM616 316.6c-22.1 0-40 17.9-40 40v306c0 22.1 17.9 40 40 40s40-17.9 40-40v-306c0-22.1-17.9-40-40-40z" p-id="2496"></path></svg>';
        isClicked = true;
    } else {
        playBtn.innerHTML = '<svg t="1699099682792" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2348" width="48" height="48"><path d="M923.5 336.9c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1C629.7 75 571 63.1 510.5 63.1S391.3 75 336 98.3c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.2 174.5c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5s-11.9-119.2-35.3-174.5z m-413 542.8c-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3 203.1 0 368.3 165.2 368.3 368.3 0 203.1-165.2 368.3-368.3 368.3z" p-id="2349"></path><path d="M647.4 341.8c-12.4-7.1-27.6-7.1-40 0l-233.8 135c-12.4 7.1-20 20.4-20 34.6 0 14.3 7.6 27.5 20 34.6l233.8 135c6.2 3.6 13.1 5.4 20 5.4s13.8-1.8 20-5.4c12.4-7.1 20-20.3 20-34.6v-270c0-14.3-7.6-27.5-20-34.6z m-60 235.3l-113.8-65.7 113.8-65.7v131.4z" p-id="2350"></path></svg>';
        isClicked = false;
    }
});