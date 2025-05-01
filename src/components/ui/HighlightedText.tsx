interface Props {
  link: string;
  text: string;
  target?: string;
}

const HighlightedText: React.FC<Props> = ({ link, text, target }) => {
  return (
    <a
      href={link}
      className="text-white group transition-all duration-300 ease-in-out"
      target={target || "_blank"}
    >
      <span className="bg-left-bottom bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500 ease-out">
        {text}
      </span>
    </a>
  );
};

export default HighlightedText;
