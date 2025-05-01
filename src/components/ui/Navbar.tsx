import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 z-50 p-4 w-full font-cencschit">
      <div className="flex justify-between px-8 mx-auto mt-2">
        <div id="eveeze" className="text-left">
          <Link to={"/"}>
            <h1 className="text-sm font-normal font-cencschit text-whiteText">
              EVEEZE
            </h1>
          </Link>
        </div>
        <div className="flex gap-8">
          <ul className="flex justify-between space-x-4 text-sm font-normal text-whiteText">
            <li>
              <Link to={"/about"}>ABOUT</Link>
            </li>
            <li>
              <Link to={"/project"}>PROJECT</Link>
            </li>
            <li>
              <Link to={"/contact"}>CONTACT</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
