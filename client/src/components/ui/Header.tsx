import { useState } from "react";
import { BUS_ICON_URL_HEADER } from "../../lib/constants";
import { PopupModal } from "./PopupModal";
import type { PopupData } from "../../lib/types";

interface HeaderProps {
  polling: boolean;
  onTogglePolling: () => void;
}

export const Header = ({ polling, onTogglePolling }: HeaderProps) => {
  const [infoPopup, setInfoPopup] = useState<PopupData | null>(null);

  const openInfo = () => {
    setInfoPopup({
      title: "Információ",
      txt: `<h3><b>Jogi nyilatkozat</b></h3>
      <p>Ez az alkalmazás egy független projekt, és semmilyen kapcsolatban nem áll a BudapestGO-val, a BKK-val vagy azok kapcsolt szervezeteivel. Az alkalmazás nem hivatalos termék, nem áll támogatás, jóváhagyás vagy együttműködés alatt. Az esetleges formai vagy funkcionális hasonlóságok kizárólag a felhasználói élmény javítását szolgálják. Minden védjegy, logó és márkanév a jogos tulajdonosának tulajdonát képezi.</p>
      <br/>
      <p>Az alkalmazás továbbá semmilyen kapcsolatban nem áll a Molteam vállalattal, amely a gödi buszkövető alkalmazás eredeti fejlesztője, és nem áll fenn köztük semmilyen együttműködés, támogatás vagy hivatalos kapcsolat. A projekt teljes mértékben független a Molteam által fejlesztett szolgáltatásoktól és alkalmazásoktól.
      <b><a href="https://god.molteam.hu/">https://god.molteam.hu/</a></b>
      </p>
      <br/>
      <h3><b>Kapcsolat</b></h3>
      <p>Amennyiben kérdése, észrevétele vagy hibabejelentése van az alkalmazással kapcsolatban, kérjük, nyisson egy új hibajegyet (Issue) a projekt GitHub-oldalán:
      <br/>
      <b><a href="https://github.com/Bacce/GodBusz/issues">https://github.com/Bacce/GodBusz/issues</a></b>
      <br/><br/>
      Minden bejelentést és visszajelzést köszönettel fogadunk.</p>`,
    });
  };

  return (
    <>
      <header className="flex items-center justify-between h-13.5 bg-white border-b-[3px] border-[#c6c6c6] px-4">
        <img src="/logo_godgo.png" alt="Logo" className="max-h-full" />
        <div className="flex gap-2">
          <button
            onClick={onTogglePolling}
            className={`pl-2 pr-4 py-1 rounded w-fit flex items-center gap-2 transition-colors ${
              polling
                ? "bg-[#009EE3] text-white"
                : "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <img src={BUS_ICON_URL_HEADER} alt="" className="w-8" />
            Járművek követése
          </button>
          <button
            onClick={openInfo}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-[#009EE3] text-white hover:bg-[#008BCC] font-bold text-xl"
          >
            i
          </button>
        </div>
      </header>
      {infoPopup && (
        <PopupModal popup={infoPopup} onDismiss={() => setInfoPopup(null)} />
      )}
    </>
  );
};
