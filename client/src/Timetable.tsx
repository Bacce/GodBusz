export const Timetable = ({ trips }) => {
  return (
    <div>
      {trips.map((trip) => (
        <>
          <span>{trip.time}</span>
          <br />
        </>
      ))}
    </div>
  );
};
