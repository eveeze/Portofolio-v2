// TechStackCard.tsx
interface TechStackCardProps {
  stack: {
    name: string;
    icon: string;
  };
}

const TechStackCard = ({ stack }: TechStackCardProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md backdrop-blur-sm  bg-transparent">
      <img src={stack.icon} alt={stack.name} className="w-6 h-6" />
      <span className="text-whiteText text-sm font-medium font-centsbook">
        {stack.name} </span>
    </div>
  );
};

export default TechStackCard;


