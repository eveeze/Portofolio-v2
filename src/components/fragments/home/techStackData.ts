import cssIcon from "../../../assets/images/css.svg";
import dartIcon from "../../../assets/images/dart.svg";
import flaskIcon from "../../../assets/images/flask.svg";
import flutterIcon from "../../../assets/images/flutter.svg";
import framerIcon from "../../../assets/images/framer.svg";
import gsapIcon from "../../../assets/images/gsap.svg";
import html5Icon from "../../../assets/images/html5.svg";
import jsIcon from "../../../assets/images/js.svg";
import nextjsIcon from "../../../assets/images/nextjs.svg";
import nodejsIcon from "../../../assets/images/nodejs.svg";
import prismaIcon from "../../../assets/images/prisma.svg";
import mongodbIcon from "../../../assets/images/mongodb.svg";
import mysqlIcon from "../../../assets/images/mysql.svg";
import postgresqlIcon from "../../../assets/images/postgresql.svg";
import reactIcon from "../../../assets/images/reactjs.svg";
import pythonIcon from "../../../assets/images/python.svg";
import ractrouterIcon from "../../../assets/images/reactrouter.svg";
import tailwindcssIcon from "../../../assets/images/tailwindcss.svg";

import typescriptIcon from "../../../assets/images/typescript.svg";
import vitejsIcon from "../../../assets/images/vitejs.svg";
export interface TechStackItem {
  name: string;
  icon: string;
}

export const techStackData: TechStackItem[] = [
  { name: "HTML", icon: html5Icon },
  { name: "CSS", icon: cssIcon },
  { name: "JavaScript", icon: jsIcon },
  { name: "TypeScript", icon: typescriptIcon },
  { name: "Dart", icon: dartIcon },
  { name: "Flutter", icon: flutterIcon },
  { name: "Flask", icon: flaskIcon },
  { name: "Framer", icon: framerIcon },
  { name: "GSAP", icon: gsapIcon },
  { name: "Next.js", icon: nextjsIcon },
  { name: "Node.js", icon: nodejsIcon },
  { name: "Prisma", icon: prismaIcon },
  { name: "MongoDB", icon: mongodbIcon },
  { name: "MySQL", icon: mysqlIcon },
  { name: "PostgreSQL", icon: postgresqlIcon },
  { name: "React", icon: reactIcon },
  { name: "Python", icon: pythonIcon },
  { name: "React Router", icon: ractrouterIcon },
  { name: "Tailwind CSS", icon: tailwindcssIcon },
  { name: "Vite", icon: vitejsIcon },
];
