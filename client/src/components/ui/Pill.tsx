interface PillProps {
  variant: string;
  children: React.ReactNode;
}

export const Pill = ({ variant, children }: PillProps) => {
  const colorClass =
    {
      G1: "bg-g1",
      G2: "bg-g2",
      G3: "bg-g3",
      G4: "bg-g4",
    }[variant] || "bg-g3";

  return (
    <div
      className={`flex p-1 text-white font-bold justify-center items-center w-10 leading-none rounded-sm my-1
      ${colorClass}`}
    >
      {children}
    </div>
  );
};
