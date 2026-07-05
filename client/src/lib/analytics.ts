const GTM_ID = "G-EL1XL7XCKT";

export const initGTM = () => {
  if (typeof window === "undefined") return;

  if (document.getElementById("gtm-script")) return;

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`;
  document.head.appendChild(script);
  // @ts-expect-error google tag manager
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // @ts-expect-error google tag manager
    window.dataLayer.push(arguments);
  }
  // @ts-expect-error google tag manager
  gtag("js", new Date());
  // @ts-expect-error google tag manager
  gtag("config", GTM_ID);
};
