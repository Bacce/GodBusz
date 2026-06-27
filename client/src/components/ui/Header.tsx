import { useState, useEffect, useRef } from "react";
import { BUS_ICON_URL_HEADER } from "../../lib/constants";
import { PopupModal } from "./PopupModal";
import { Pill } from "./Pill";
import type { PopupData, Stop } from "../../lib/types";

interface HeaderProps {
  polling: boolean;
  onTogglePolling: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  stops: Stop[];
  onStopSelect: (mid: string, focusOnly?: boolean) => void;
}

export const Header = ({
  polling,
  onTogglePolling,
  selectedDate,
  onDateChange,
  stops,
  onStopSelect,
}: HeaderProps) => {
  const [infoPopup, setInfoPopup] = useState<PopupData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      Minden bejelentést és visszajelzést köszönettel fogadunk.</p>
      <br/>
      <h3><b>Sütik</b></h3>
      <p>Sütiket használunk a weboldal használatának elemzésére. A Google Analytics anonim adatokat gyűjt az oldalmegtekintésekről a szolgáltatás fejlesztése érdekében. Az analitikai sütik csak hozzájárulás esetén aktiválódnak.</p>
      `,
    });
  };

  const normalize = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredStops = stops.filter((s) =>
    normalize(s.name).includes(normalize(searchQuery))
  );

  const groupedStops = filteredStops.reduce((acc, stop) => {
    const normName = normalize(stop.name);
    if (!acc[normName]) {
      acc[normName] = {
        originalName: stop.name,
        stops: [],
      };
    }
    acc[normName].stops.push(stop);
    return acc;
  }, {} as Record<string, { originalName: string; stops: Stop[] }>);

  return (
    <>
      <header className="flex items-center justify-between h-13.5 bg-white border-b-[3px] border-[#c6c6c6] px-4">
        <div className="flex items-center gap-4">
          <img src="/logo_godgo.png" alt="Logo" className="max-h-full" />
          
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Keresés megálló..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-64 px-2 py-1 rounded border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#009EE3]"
            />
            {isOpen && Object.keys(groupedStops).length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-b-md z-[1001] max-h-60 overflow-y-auto py-1">
                {Object.entries(groupedStops).map(([_, group]) => {
                  const { originalName, stops: stopsForName } = group;
                  return (
                    <div 
                      key={originalName} 
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                      onClick={() => {
                        if (stopsForName.length === 1) {
                          onStopSelect(stopsForName[0].mid);
                          setIsOpen(false);
                          setSearchQuery("");
                        } else {
                          onStopSelect(stopsForName[0].mid, true);
                        }
                      }}
                    >
                      <span>{originalName}</span>
                      <div className="flex gap-1">
                        {stopsForName.map((s) => (
                          <div key={s.mid} onClick={(e) => {
                            e.stopPropagation();
                            onStopSelect(s.mid);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}>
                            <Pill variant={s.route}>{s.route}</Pill>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">


            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-44 px-2 py-1 rounded border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#009EE3]"
            />
            <button
              onClick={openInfo}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-[#009EE3] text-white hover:bg-[#008BCC] font-bold text-lg"
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
