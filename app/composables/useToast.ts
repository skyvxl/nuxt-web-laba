export function useToast() {
  function showToast(message: string, type: "success" | "error" = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-top toast-end z-50`;
    
    const alert = document.createElement("div");
    alert.className = `alert alert-soft alert-${type === "success" ? "success" : "error"}`;
    
    const span = document.createElement("span");
    span.textContent = message;
    
    alert.appendChild(span);
    toast.appendChild(alert);
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  return {
    showToast,
  };
}
