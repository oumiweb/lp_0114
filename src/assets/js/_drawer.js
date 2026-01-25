// === 定数定義 ===


const ANIMATION = {
  DURATION: 500,
};

const activeAnimations = new WeakMap();

// === ユーティリティ関数 ===

function isElementHidden(element) {
  return window.getComputedStyle(element).display === "none";
}

function animate(element, updateFn, completeFn = () => {}, duration = ANIMATION.DURATION) {
  const prevState = activeAnimations.get(element);
  if (prevState) {
    prevState.cancelled = true;
    cancelAnimationFrame(prevState.rafId);
  }

  let start = null;
  const state = { cancelled: false, rafId: 0 };

  function frame(timestamp) {
    if (state.cancelled) return;
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const ratio = duration === 0 ? 1 : Math.min(progress / duration, 1);

    updateFn(ratio);

    if (ratio < 1) {
      state.rafId = requestAnimationFrame(frame);
    } else {
      activeAnimations.delete(element);
      completeFn();
    }
  }

  state.rafId = requestAnimationFrame(frame);
  activeAnimations.set(element, state);
}


function rememberDisplay(element) {
  if (!element.dataset.originalDisplay) {
    const computedDisplay = window.getComputedStyle(element).display;
    if (computedDisplay && computedDisplay !== "none") {
      element.dataset.originalDisplay = computedDisplay;
    }
  }
}

function showElement(element) {
  rememberDisplay(element);
  element.style.display = element.dataset.originalDisplay || "block";
}

// === アニメーション関数 ===

function slideDown(element, duration = ANIMATION.DURATION) {
  showElement(element);
  const height = element.scrollHeight;
  element.style.height = "0px";
  element.style.overflow = "hidden";

  animate(
    element,
    ratio => {
      element.style.height = `${height * ratio}px`;
    },
    () => {
      element.style.height = "";
      element.style.overflow = "";
    },
    duration,
  );
}

function slideUp(element, duration = ANIMATION.DURATION) {
  rememberDisplay(element);
  const height = element.scrollHeight;
  element.style.height = `${height}px`;
  element.style.overflow = "hidden";

  animate(
    element,
    ratio => {
      element.style.height = `${height * (1 - ratio)}px`;
    },
    () => {
      element.style.display = "none";
      element.style.height = "";
      element.style.overflow = "";
    },
    duration,
  );
}

function slideToggle(element, duration = ANIMATION.DURATION) {
  if (isElementHidden(element)) {
    slideDown(element, duration);
  } else {
    slideUp(element, duration);
  }
}

// === 初期化 ===

document.addEventListener("DOMContentLoaded", function () {

  // アコーディオン
  const accordionItems = document.querySelectorAll(".js-drawer-accordion");
  accordionItems.forEach(item => {
    item.addEventListener("click", function () {
      const content = this.nextElementSibling;
      if (content) {
        const isOpening = this.classList.contains("is-open");
        slideToggle(content);
        this.classList.toggle("is-open");

        if (isOpening) {
          // アコーディオンを閉じる時
          this.setAttribute("aria-expanded", "false");
          this.setAttribute("aria-label", "事業内容を展開");
          content.setAttribute("aria-hidden", "true");
        } else {
          // アコーディオンを開く時
          this.setAttribute("aria-expanded", "true");
          this.setAttribute("aria-label", "事業内容を折りたたみ");
          content.setAttribute("aria-hidden", "false");
        }
      }
    });
  });

  // === モーダルの処理 ===
  const openButtons = document.querySelectorAll('.js-modal-open');
  const closeButtons = document.querySelectorAll('.js-modal-close');
  const masks = document.querySelectorAll('.c-modal__mask');

  openButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const modal = document.getElementById(targetId);
      const mask = document.querySelector('.c-modal__mask');

      modal?.classList.remove('hidden');
      mask?.classList.remove('hidden');
    });
  });

  function closeModal() {
    const modals = document.querySelectorAll('.c-modal');
    const mask = document.querySelector('.c-modal__mask');
    modals.forEach(modal => modal.classList.add('hidden'));
    mask?.classList.add('hidden');
  }

  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });

  masks.forEach(mask => {
    mask.addEventListener('click', closeModal);
  });
});
