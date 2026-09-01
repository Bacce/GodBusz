import * as cheerio from "cheerio";

const BASE_URL = "https://vonatinfo.mav.hu/map.aspx/getData";

async function requestMavStopData(stopId) {
    const data = {
        "a": "STATION",
        "jo": {
            "a": stopId
        }
    }
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`External API responded with status ${response.status}`);
    }

    const json = await response.json();
    // safe guard to prevent null
    if (!json?.d?.result) {
        throw new Error("No result from MAV API");
    }

    return parseMavSchedule(json.d.result);
}

/**
 * Helper function to convert local date components in Europe/Budapest timezone (CET/CEST)
 * into a UTC epoch timestamp (in milliseconds).
 *
 * @param {number} year - Full year
 * @param {number} monthIndex - Month index (0-indexed)
 * @param {number} day - Day of month
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {number} Epoch timestamp in milliseconds.
 */
export function toCetTimestamp(year, monthIndex, day, hours, minutes) {
    const utcGuess = Date.UTC(year, monthIndex, day, hours, minutes, 0, 0);
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Budapest",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const parts = formatter.formatToParts(new Date(utcGuess));
    const partObj = {};
    for (const p of parts) {
        if (p.type !== "literal") {
            partObj[p.type] = p.value;
        }
    }

    let bHour = parseInt(partObj.hour, 10);
    if (bHour === 24) bHour = 0;

    const budapestAsUtc = Date.UTC(
        parseInt(partObj.year, 10),
        parseInt(partObj.month, 10) - 1,
        parseInt(partObj.day, 10),
        bHour,
        parseInt(partObj.minute, 10),
        parseInt(partObj.second, 10)
    );

    const offsetMs = budapestAsUtc - utcGuess;
    return utcGuess - offsetMs;
}

/**
 * Parses MÁV schedule HTML table into JSON with Unix timestamps (in ms).
 * @param {string} htmlString - The raw HTML content.
 * @returns {Array<Object>} List of parsed train entries.
 */
function parseMavSchedule(htmlString) {
    const $ = cheerio.load(htmlString);
    const results = [];

    // 1. Try to extract the base date from the HTML (e.g., "2026.08.29.")
    // If not found, default to today's current date in CET/CEST (Europe/Budapest).
    let baseYear, baseMonth, baseDay;
    const titleText = $('table.af th.title font').text().trim();
    const dateMatch = titleText.match(/(\d{4})\.(\d{2})\.(\d{2})\.?/);

    if (dateMatch) {
        baseYear = parseInt(dateMatch[1], 10);
        baseMonth = parseInt(dateMatch[2], 10) - 1; // 0-indexed in JS Date
        baseDay = parseInt(dateMatch[3], 10);
    } else {
        const nowStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Budapest" }).format(new Date());
        const [y, m, d] = nowStr.split("-").map(Number);
        baseYear = y;
        baseMonth = m - 1;
        baseDay = d;
    }

    // Helper to convert "HH:MM" string to a timestamp (milliseconds) in CET (Europe/Budapest)
    function toTimestamp(timeStr) {
        if (!timeStr || !/^[0-9]{2}:[0-9]{2}$/.test(timeStr)) {
            return null;
        }
        const [hours, minutes] = timeStr.split(':').map(Number);
        return toCetTimestamp(baseYear, baseMonth, baseDay, hours, minutes);
    }

    // Helper to extract scheduled and actual times from a <td> cell
    function extractTimes(cell) {
        const cellHtml = cell.html() || '';

        // Match primary scheduled time (format: HH:MM)
        const scheduledMatch = cellHtml.match(/^([0-9]{2}:[0-9]{2})/);
        const scheduledTime = scheduledMatch ? scheduledMatch[1] : null;

        // Match actual time inside span (e.g. <span style="color:red">00:23</span>)
        const spanText = cell.find('span').text().trim();
        const actualTime = /^[0-9]{2}:[0-9]{2}$/.test(spanText) ? spanText : null;

        return {
            scheduled: toTimestamp(scheduledTime),
            actual: toTimestamp(actualTime)
        };
    }

    // Iterate through table rows that represent train entries
    $('table.af tr[valign="top"]').each((index, element) => {
        const row = $(element);
        const tds = row.find('td');

        if (tds.length >= 4) {
            const arrivalCell = $(tds[0]);
            const departureCell = $(tds[1]);
            const trackCell = $(tds[2]);
            const descriptionCell = $(tds[3]);

            const arrival = extractTimes(arrivalCell);
            const departure = extractTimes(departureCell);

            // Extract the train ID from the <a> tag
            const trainLink = descriptionCell.find('a');
            const trainId = trainLink.text().trim() || null;

            // Remove <a> element so it doesn't duplicate in description
            const descClone = descriptionCell.clone();
            descClone.find('a').remove();

            // Clean up description text
            const rawDescription = descClone
                .text()
                .replace(/\u00a0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            const description = cleanTrainDescription(rawDescription);

            const track = trackCell.text().trim() || null;

            results.push({
                trainId: trainId,
                arrival: arrival.scheduled,
                arrivalActual: arrival.actual,
                departure: departure.scheduled,
                departureActual: departure.actual,
                track: track,
                description: description,
                rawDescription: rawDescription
            });
        }
    });

    return results;
}

/**
 * Pure helper function to clean up MÁV train description text.
 * Strips all text up to and including the first time (HH:MM),
 * as well as any trailing time (HH:MM) at the end.
 *
 * Example:
 *   "személy 14:34 Vác -- Budapest-Nyugati 15:14" -> "Vác -- Budapest-Nyugati"
 *
 * @param {string} text - Raw description text.
 * @returns {string} Cleaned description text.
 */
export function cleanTrainDescription(text) {
    if (!text) return "";
    return text
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^.*?\b\d{1,2}:\d{2}\s*/, '')
        .replace(/\s*\b\d{1,2}:\d{2}\s*$/, '')
        .trim();
}

export const mavService = { requestMavStopData, cleanTrainDescription, toCetTimestamp };

