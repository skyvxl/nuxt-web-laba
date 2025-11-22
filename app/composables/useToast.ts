export function useToast() {
  function showToast(message: string, type: "success" | "error" = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-top toast-end z-50`;
    toast.innerHTML = `
      <div class="alert alert-soft alert-${
        type === "success" ? "success" : "error"
      }">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  return {
    showToast,
  };
}
