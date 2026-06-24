export const Timetable = ({ trips }) => {
  const now = new Date().toLocaleTimeString("en-GB"); // ponytail: "HH:mm:ss" format
  let nextFound = false;

  return (
    <div>
      {trips.map((trip) => {
        const isPast = trip.time < now;
        const isNext = !isPast && !nextFound;
        if (isNext) nextFound = true;

        return (
          <div
            key={trip.time}
            style={{
              color: isPast ? "lightgrey" : isNext ? "black" : "inherit",
              fontWeight: isNext ? "bold" : "normal",
            }}
          >
            {trip.time}
          </div>
        );
      })}
    </div>
  );
};
