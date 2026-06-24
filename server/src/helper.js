/**
 * Returns the current date as a string in YYYY-MM-DD format.
 * @returns {string} The formatted date string.
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
          trips,
        };
      }),
  };
};

export const getAllBus = (json) => {
  return json.data
    .map((child) => {
      return {
        plate: child[0]?.rendszam.split(",")[0],
        route: child[0]?.jarat,
      };
    })
    .filter(Boolean);
};
