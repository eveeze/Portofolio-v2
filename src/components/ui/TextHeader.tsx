interface Props {
  text: string;
  location: "start" | "end";
}

const TextHeader: React.FC<Props> = ({ text, location }) => {
  const justifyClass = location === "start" ? "justify-start" : "justify-end";

  return (
    <h1
      className={`px-8 font-normal flex ${justifyClass} text-[250px] font-oggs`}
    >
      {text}
    </h1>
  );
};

export default TextHeader;
