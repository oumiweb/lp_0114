/**
 * フォームバリデーション
 */

// 定数定義
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGIT_ONLY_REGEX = /^\d+$/;

// エラーメッセージ
const ERROR_MESSAGES = {
  REQUIRED: "※この項目は必須です",
  EMAIL_INVALID: "※正しいメールアドレスを入力してください",
  TEL_INVALID_FORMAT: "※電話番号は数字で入力してください（ハイフンは任意）",
  TEL_INVALID: "※正しい電話番号を入力してください（ハイフンは任意）",
};

/**
 * エラーメッセージを表示
 * @param {HTMLElement} field - フィールド要素
 * @param {string} message - エラーメッセージ
 */
function showError(field, message) {
  removeError(field);

  const errorElement = document.createElement("span");
  errorElement.className = "p-form__error";
  errorElement.textContent = message;
  errorElement.setAttribute("role", "alert");

  const formItem = field.closest(".p-form__item");
  if (formItem) {
    formItem.appendChild(errorElement);
  }

  field.setAttribute("aria-invalid", "true");
  field.classList.add("is-error");
}

/**
 * エラーメッセージを削除
 * @param {HTMLElement} field - フィールド要素
 */
function removeError(field) {
  const formItem = field.closest(".p-form__item");
  if (formItem) {
    const errorElement = formItem.querySelector(".p-form__error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  field.removeAttribute("aria-invalid");
  field.classList.remove("is-error");
}

/**
 * ラジオボタン/チェックボックスが選択されているかチェック
 * @param {HTMLElement} field - フィールド要素
 * @param {HTMLFormElement} form - フォーム要素
 * @returns {boolean}
 */
function isGroupFieldChecked(field, form) {
  const sameNameFields = form.querySelectorAll(`[name="${field.name}"]`);
  return Array.from(sameNameFields).some(f => f.checked);
}

/**
 * 必須フィールドのバリデーション
 * @param {HTMLElement} field - フィールド要素
 * @param {HTMLFormElement} form - フォーム要素
 * @returns {boolean} バリデーション結果
 */
function validateRequired(field, form) {
  if (field.type === "checkbox") {
    if (!field.checked) {
      showError(field, ERROR_MESSAGES.REQUIRED);
      return false;
    }
  } else if (field.type === "radio") {
    if (!isGroupFieldChecked(field, form)) {
      showError(field, ERROR_MESSAGES.REQUIRED);
      return false;
    }
  } else {
    if (field.value.trim() === "") {
      showError(field, ERROR_MESSAGES.REQUIRED);
      return false;
    }
  }

  removeError(field);
  return true;
}

/**
 * メールアドレスのバリデーション
 * @param {HTMLElement} field - フィールド要素
 * @param {HTMLFormElement} form - フォーム要素
 * @returns {boolean} バリデーション結果
 */
function validateEmail(field, form) {
  const value = field.value.trim();

  if (value === "") {
    return validateRequired(field, form);
  }

  if (!EMAIL_REGEX.test(value)) {
    showError(field, ERROR_MESSAGES.EMAIL_INVALID);
    return false;
  }

  removeError(field);
  return true;
}

/**
 * 電話番号のバリデーション
 * @param {HTMLElement} field - フィールド要素
 * @returns {boolean} バリデーション結果
 */
function validateTel(field) {
  const value = field.value.trim();

  // 電話番号は任意なので、空の場合はバリデーションをスキップ
  if (value === "") {
    removeError(field);
    return true;
  }

  // ハイフンを除去
  const telWithoutHyphen = value.replace(/-/g, "");

  // 数字のみかチェック
  if (!DIGIT_ONLY_REGEX.test(telWithoutHyphen)) {
    showError(field, ERROR_MESSAGES.TEL_INVALID_FORMAT);
    return false;
  }

  // 桁数チェック（10桁または11桁）
  if (telWithoutHyphen.length < 10 || telWithoutHyphen.length > 11) {
    showError(field, ERROR_MESSAGES.TEL_INVALID);
    return false;
  }

  removeError(field);
  return true;
}

/**
 * フィールドのバリデーション（統一インターフェース）
 * @param {HTMLElement} field - フィールド要素
 * @param {HTMLFormElement} form - フォーム要素
 * @returns {boolean} バリデーション結果
 */
function validateField(field, form) {
  if (field.type === "email") {
    return validateEmail(field, form);
  }

  if (field.type === "tel") {
    return validateTel(field);
  }

  if (field.type === "checkbox" || field.type === "radio") {
    if (field.required) {
      return validateRequired(field, form);
    }
    // 任意のラジオ/チェックボックスは常に有効
    removeError(field);
    return true;
  }

  if (field.required) {
    return validateRequired(field, form);
  }

  // 任意フィールドでエラーがある場合はクリア
  removeError(field);
  return true;
}

/**
 * フォームのバリデーション
 * @param {HTMLFormElement} form - フォーム要素
 * @returns {boolean} バリデーション結果
 */
function validateForm(form) {
  let isValid = true;

  // 必須フィールドのバリデーション
  const requiredFields = form.querySelectorAll("input[required], textarea[required], select[required]");
  requiredFields.forEach(field => {
    if (!validateField(field, form)) {
      isValid = false;
    }
  });

  // 任意の電話番号フィールドのバリデーション
  const telFields = form.querySelectorAll('input[type="tel"]:not([required])');
  telFields.forEach(field => {
    if (field.value.trim() !== "" && !validateTel(field)) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * フィールドにイベントリスナーを設定
 * @param {HTMLElement} field - フィールド要素
 * @param {HTMLFormElement} form - フォーム要素
 */
function setupFieldEvents(field, form) {
  // blur時のバリデーション
  field.addEventListener("blur", () => {
    validateField(field, form);
  });

  // 入力中のエラークリア
  field.addEventListener("input", () => {
    if (field.classList.contains("is-error")) {
      validateField(field, form);
    }
  });
}

/**
 * ラジオボタン/チェックボックスグループのイベント設定
 * @param {HTMLElement} field - フィールド要素
 * @param {HTMLFormElement} form - フォーム要素
 */
function setupGroupFieldEvents(field, form) {
  field.addEventListener("change", () => {
    const sameNameFields = form.querySelectorAll(`[name="${field.name}"]`);
    sameNameFields.forEach(f => {
      removeError(f);
    });
  });
}

/**
 * フォームバリデーションの初期化
 */
function initFormValidation() {
  const form = document.querySelector(".p-form");
  if (!form) return;

  // 送信時のバリデーション
  form.addEventListener("submit", e => {
    e.preventDefault();

    if (validateForm(form)) {
      // バリデーション成功時に完了ページへ遷移
      window.location.href = "/contact/complete.html";
    } else {
      // 最初のエラーフィールドにフォーカス
      const firstError = form.querySelector('.is-error, [aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  });

  // 各フィールドにイベントリスナーを設定
  const fields = form.querySelectorAll("input, textarea, select");
  fields.forEach(field => {
    setupFieldEvents(field, form);

    // ラジオボタン/チェックボックスのグループ処理
    if (field.type === "radio" || field.type === "checkbox") {
      setupGroupFieldEvents(field, form);
    }
  });
}

// DOMContentLoaded時に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormValidation);
} else {
  initFormValidation();
}

export default initFormValidation;
