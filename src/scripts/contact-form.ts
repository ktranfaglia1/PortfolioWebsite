/**
 * Progressive enhancement for the contact form. Without JS the form POSTs to
 * Formspree directly; with JS it submits with fetch and shows the result
 * inline. formspreeErrorMessage is pure and unit-tested.
 */

type FormspreeError = { errors?: { field?: string; message?: string }[] };

/** Turn a Formspree error response into one readable sentence. */
export function formspreeErrorMessage(body: unknown): string {
  const errors = (body as FormspreeError | null)?.errors ?? [];
  const messages = errors
    .map((e) => (e.field ? `${e.field} ${e.message ?? ""}` : (e.message ?? "")))
    .map((m) => m.trim())
    .filter(Boolean);
  return messages.length > 0
    ? `${messages.join(". ")}.`.replace(/\.\.$/, ".")
    : "Something went wrong sending your message.";
}

export function enhanceContactForm(form: HTMLFormElement): void {
  const status = form.querySelector<HTMLElement>("[data-form-status]")!;
  const submit = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
  const success = document.querySelector<HTMLElement>("[data-form-success]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    submit.disabled = true;
    status.dataset.state = "pending";
    status.textContent = "Sending…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        status.textContent = "";
        delete status.dataset.state;
        if (success) {
          form.hidden = true;
          success.hidden = false;
          success.focus();
        }
        return;
      }
      const body: unknown = await response.json().catch(() => null);
      status.dataset.state = "error";
      status.textContent = `${formspreeErrorMessage(body)} You can also email me directly.`;
    } catch {
      status.dataset.state = "error";
      status.textContent =
        "Couldn't reach the form service. Check your connection, or email me directly.";
    } finally {
      submit.disabled = false;
    }
  });
}
