import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  selectedDate,
  onDateChange,
  stops,
  onStopSelect,
}: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
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
      <br/>Link: <b><a href="https://god.molteam.hu/">Hivatalos buszkövető alkalmazás</a></b>
      <br/>Link: <b><a href="https://god.hu/elet-a-varosban/varosinformacio/kozossegi-kozlekedes/">További információk Göd város weboldalán</a></b>
      </p>
      <br/>
      <h3><b>Kapcsolat</b></h3>
      <p>Amennyiben kérdése, észrevétele vagy hibabejelentése van az alkalmazással kapcsolatban, kérjük, nyisson egy új hibajegyet (Issue) a projekt GitHub-oldalán:
      <br/>
      Link: <b><a href="https://github.com/Bacce/GodBusz/issues">GitHub hibajegyek</a></b>
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

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorite_stops");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (mids: string | string[]) => {
    const targetMids = Array.isArray(mids) ? mids : [mids];
    const isRemoving = targetMids.every((mid) => favorites.includes(mid));

    let newFavorites = [...favorites];
    if (isRemoving) {
      newFavorites = favorites.filter((id) => !targetMids.includes(id));
    } else {
      targetMids.forEach((mid) => {
        if (!newFavorites.includes(mid)) newFavorites.push(mid);
      });
    }

    setFavorites(newFavorites);
    localStorage.setItem("favorite_stops", JSON.stringify(newFavorites));
  };

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

  const sortedGroups = Object.entries(groupedStops).sort(([_, a], [__, b]) => {
    const aFav = a.stops.some((s) => favorites.includes(s.mid));
    const bFav = b.stops.some((s) => favorites.includes(s.mid));
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <>
      <header className="flex items-center justify-between h-13.5 bg-white border-b-[3px] border-[#c6c6c6] px-4 max-sm:px-2">
        <div className="flex items-center gap-2">
          <div
            className="h-10 w-[140px] bg-cover bg-left max-sm:w-[40px] cursor-pointer bg-[url('/logo_godgo.svg')] max-sm:bg-[url('/icon.svg')]"
            onClick={() => navigate("/")}
          />


          <div className="relative" ref={dropdownRef}>
            {!location.pathname.startsWith("/stop/") && (
              <>
                <input
                  type="text"
                  placeholder="Megállók..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  className="w-64 max-sm:w-[100px] px-2 py-1 rounded border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#009EE3]"
                />
                {isOpen && sortedGroups.length > 0 && (
                  <div className="absolute top-full left-0 w-full min-w-[250px] bg-white border border-gray-300 shadow-lg rounded-b-md z-[1001] max-h-60 overflow-y-auto py-1">
                    {sortedGroups.map(([_, group]) => {
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
                          <span className="flex items-center gap-2">
                            <button
                              className={`transition-colors ${stopsForName.some((s) => favorites.includes(s.mid))
                                ? "text-yellow-500"
                                : "text-gray-400 hover:text-yellow-500"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(stopsForName.map((s) => s.mid));
                              }}
                            >
                              {stopsForName.some((s) => favorites.includes(s.mid)) ? "★" : "☆"}
                            </button>
                            {originalName}
                          </span>
                          <div className="flex gap-1">
                            {stopsForName.map((s) => (
                              <div key={s.mid} onClick={(e) => {
                                e.stopPropagation();
                                onStopSelect(s.mid);
                                setIsOpen(false);
                                setSearchQuery("");
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent("open-stop-popup", { detail: s.mid }));
                                }, 500);
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
              </>
            )}
          </div>

        </div>
        <div className="flex gap-2 items-center">


          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-44 max-sm:w-auto px-2 py-1 rounded border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#009EE3]"
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
