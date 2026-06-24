export const Pill = ({ variant, children }) => {
  return (
    <div
      className={`flex p-1 text-white font-bold justify-center items-center w-10 leading-none rounded-sm my-1
      ${variant === "G3" ? "bg-[#009ee3]" : "bg-[#e41f18]"}`}
    >
      {children}
    </div>
  );
};
