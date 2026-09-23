// 스크롤 리빌 애니메이션: 이력서 블록이 화면에 들어올 때 순서대로 나타남
document.addEventListener("DOMContentLoaded", () => {
  const blocks = document.querySelectorAll(".resume-block");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    return;
  }

  blocks.forEach((block, index) => {
    block.classList.add("reveal");
    block.style.transitionDelay = `${Math.min(index, 5) * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  blocks.forEach((block) => observer.observe(block));
});

// 오늘의 할 일: localStorage 기반, 날짜가 바뀌면 기본 항목으로 초기화
(() => {
  const STORAGE_KEY = "introduce-myself-todos";
  const DEFAULT_TASKS = ["앱센터 스터디", "근로"];

  function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function makeItem(text) {
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, done: false };
  }

  function loadState() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      saved = null;
    }

    const key = todayKey();
    if (saved && saved.date === key && Array.isArray(saved.items)) {
      return saved;
    }

    // 새로운 하루: 기본 할 일로 초기화
    return { date: key, items: DEFAULT_TASKS.map(makeItem) };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* localStorage 사용 불가 시 무시 */
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const list = document.getElementById("todo-list");
    const empty = document.getElementById("todo-empty");
    const count = document.getElementById("todo-count");
    const clearDoneBtn = document.getElementById("todo-clear-done");
    const dateLabel = document.getElementById("todo-date");

    if (!form || !list) return;

    const state = loadState();
    saveState(state);

    if (dateLabel) {
      dateLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(new Date());
    }

    function render() {
      list.innerHTML = "";
      state.items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "todo-item" + (item.done ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.done;
        checkbox.setAttribute("aria-label", `${item.text} 완료 체크`);
        checkbox.addEventListener("change", () => {
          item.done = checkbox.checked;
          saveState(state);
          render();
        });

        const text = document.createElement("span");
        text.className = "todo-text";
        text.textContent = item.text;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "todo-remove-btn";
        removeBtn.setAttribute("aria-label", `${item.text} 삭제`);
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", () => {
          state.items = state.items.filter((t) => t.id !== item.id);
          saveState(state);
          render();
        });

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(removeBtn);
        list.appendChild(li);
      });

      const doneCount = state.items.filter((t) => t.done).length;
      const total = state.items.length;

      if (empty) empty.style.display = total === 0 ? "block" : "none";
      if (count) count.textContent = total === 0 ? "" : `${doneCount} / ${total} 완료`;
      if (clearDoneBtn) clearDoneBtn.style.display = doneCount > 0 ? "inline" : "none";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      state.items.push(makeItem(value));
      saveState(state);
      input.value = "";
      input.focus();
      render();
    });

    if (clearDoneBtn) {
      clearDoneBtn.addEventListener("click", () => {
        state.items = state.items.filter((t) => !t.done);
        saveState(state);
        render();
      });
    }

    render();
  });
})();
