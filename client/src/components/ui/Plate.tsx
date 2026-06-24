interface PlateProps {
  children: React.ReactNode;
}

export const Plate = ({ children }: PlateProps) => (
  <div className="inline-flex items-center bg-white border border-gray-400 rounded-sm px-1 font-mono font-bold text-black shadow-sm my-1">
    <div className="bg-blue-600 w-1.5 h-4 mr-1 rounded-sm" />
    {children}
  </div>
);
