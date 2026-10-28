import cartoonUnicorn from "../assets/cartoon-unicorn.png";

export default {
  student: "Kate Ma",
  title: "White unicorn",
  frame: false,
  width: 250,
  height: 330,
  mount(root) {
    root.innerHTML = `
      <style>
        button {
          display: block;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        button:focus-visible {
          outline: 2px dashed #dca3c3;
          outline-offset: 6px;
          border-radius: 20px;
        }
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          animation: float 4s ease-in-out infinite;
        }
        button.is-happy { animation: wiggle 650ms ease-in-out; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-5deg); }
          65% { transform: rotate(5deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          img, button.is-happy { animation: none; }
        }
      </style>
      <button type="button" aria-label="Give the unicorn a little love">
        <img src="${cartoonUnicorn}" alt="A seated white cartoon plush unicorn with a pink mane and tail and an iridescent horn" draggable="false" width="250" height="330" />
      </button>
    `;

    const button = root.querySelector("button");
    button.addEventListener("click", () => {
      button.classList.remove("is-happy");
      void button.offsetWidth;
      button.classList.add("is-happy");
    });
    button.addEventListener("animationend", (event) => {
      if (event.target === button) button.classList.remove("is-happy");
    });
  },
};
