const STOP_ROTATIONS = {
  // G3 – Blue line
  966: 40,
  967: -150,
  968: -150,
  969: 140,
  970: 125,
  971: 210,
  972: 180,
  973: 0,
  974: 90,
  975: 140,
  976: -120,
  977: -140,
  978: -140,
  979: -140,
  980: -90,
  981: -130,
  982: 0,
  983: 0,
  984: 0,
  985: 0,
  986: 0,
  987: 0,

  // G4 – Red line
  991: 180,
  992: 180,
  993: 180,
  994: 180,
  995: 90,
  996: 40,
  997: 40,
  998: 40,
  999: -120,
  1000: -30,
  1001: -90,
  1002: -90,
  1003: 0,
  1004: 30,
  1005: -55,
  1006: -55,
};

/**
 * Checks if a given date string is more than one hour old.
 * @param {string} dateString - The ISO date string to check.
 * @returns {boolean} True if the date is more than one hour ago, false otherwise.
 */
export const isTooOld = (dateString) => {
  if (!dateString) return true;
  const lastUpdate = new Date(dateString);
  const now = new Date();
  const diff = now - lastUpdate;
  return diff > 60 * 60 * 1000;
};

/**
 * Validates if a string is in YYYY-MM-DD format and is a valid calendar date.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month &&
    date.getUTCDate() === day
  );
};

/**
 * Returns the current date as a string in YYYY-MM-DD format.
 */
export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats raw route data by extracting trip information from letter-prefixed keys
 * and normalizing coordinate property names.
 * @param {Object} json - The raw JSON response from the API.
 * @returns {Object} The formatted JSON data.
 */
export const formatData = (json) => {
  if (!json || !json.data || !Array.isArray(json.data)) {
    return json;
  }

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  const data = json.data.map((route) =>
    route.map((stop) => {
      const trips = [];
      alphabet.forEach((letter) => {
        const time = stop[`${letter}time`];
        const nev = stop[`${letter}nev`];
        const sd = stop[`${letter}sd`];
        const ed = stop[`${letter}ed`];

        if (
          time !== null &&
          (time !== undefined ||
            nev !== undefined ||
            sd !== undefined ||
            ed !== undefined)
        ) {
          trips.push({
            time,
            nev,
            sd,
            ed,
          });
        }
      });

      const newStop = JSON.parse(JSON.stringify(stop));
      alphabet.forEach((letter) => {
        delete newStop[`${letter}time`];
        delete newStop[`${letter}nev`];
        delete newStop[`${letter}sd`];
        delete newStop[`${letter}ed`];
      });

      // Fix lat,lon key name
      newStop.lat = newStop.lan;
      newStop.lon = newStop.lot;
      delete newStop.lan;
      delete newStop.lot;

      // Clean the license plate value
      newStop.rendszam = newStop.rendszam?.split(",")[0];

      newStop.trips = trips;
      return newStop;
    }),
  );

  return {
    ...json,
    data,
  };
};

/** Get all the stop data from the raw json response of the original API */
export const getAllStops = (json) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  return {
    stops: (json.data || [])
      .flat()
      .filter((s) => s.visible === "1")
      .map((s) => {
        const trips = [];
        alphabet.forEach((letter) => {
          const time = s[`${letter}time`];
          const nev = s[`${letter}nev`];
          const sd = s[`${letter}sd`];
          const ed = s[`${letter}ed`];

          if (
            time !== null &&
            (time !== undefined ||
              nev !== undefined ||
              sd !== undefined ||
              ed !== undefined)
          ) {
            trips.push({ time, nev, sd, ed });
          }
        });

        return {
          mid: s.mid,
          lat: s.lan,
          lon: s.lot,
          route: s.jarat,
          name: s.megallo,
          dir: STOP_ROTATIONS[s.mid] ?? null,
          trips,
        };
      }),
  };
};

export const getAllBus = (json) => {
  return json.data
    .map((child) => {
      return {
        plate: child[0]?.rendszam?.split(",")[0],
        route: child[0]?.jarat,
      };
    })
    .filter(Boolean);
};
