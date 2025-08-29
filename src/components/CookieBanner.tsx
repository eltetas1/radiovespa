import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const accepted = Cookies.get("cookiesAccepted");
    if (!accepted) {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollBottom = window.scrollY + window.innerHeight;
          const pageHeight = document.body.offsetHeight;

          const nearBottom = scrollBottom >= pageHeight - 150;
          setIsAtBottom(nearBottom);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const acceptCookies = () => {
    Cookies.set("cookiesAccepted", "true", { expires: 365 });
    window.dispatchEvent(new Event('cookies:accepted'));
    setShowBanner(false);
  };

  const rejectCookies = () => {
    Cookies.set("cookiesAccepted", "false", { expires: 365 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={`cookie-banner ${isAtBottom ? 'cookie-banner--static' : ''}`}>
      <span>
        Usamos cookies para mejorar la experiencia en nuestra página.{' '}
        <a href="/politica-de-cookies" className="link-more">Más información</a>
      </span>
      <div className="cookie-actions">
        <button onClick={acceptCookies} className="btn-cookie btn-cookie--accept">Aceptar</button>
        <button onClick={rejectCookies} className="btn-cookie btn-cookie--reject">Rechazar</button>
      </div>
    </div>
  );
}

export default CookieBanner;
