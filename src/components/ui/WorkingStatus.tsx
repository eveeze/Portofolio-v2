interface Props {
  isEmployed: boolean;
}

const WorkingStatus: React.FC<Props> = ({ isEmployed }) => {
  return (
    <div
      className={`flex items-center mt-1  ${
        isEmployed ? "text-black" : "text-white"
      }`}
    >
      {isEmployed ? null : (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium text-xs !font-centsbook tracking-wide">
            Open to Work
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkingStatus;
