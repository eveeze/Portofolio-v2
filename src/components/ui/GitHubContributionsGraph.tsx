import { useState, useRef, useEffect } from "react";
import { useGitHubContributions } from "../../hooks/githubContribution";
import { gsap } from "gsap";
import * as RadixIcons from "@radix-ui/react-icons";
import HighlightedText from "./HighlightedText";

const MONTHS: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS: string[] = ["", "Mon", "", "Wed", "", "Fri", ""];

interface Contribution {
  date: string;
  count: number;
  level: number;
}

const GitHubContributionsGrid = () => {
  const { data, loading, error } = useGitHubContributions();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeCellInfo, setActiveCellInfo] = useState<Contribution | null>(
    null
  );
  const [hoveredCell, setHoveredCell] = useState<Contribution | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const gridRef = useRef(null);
  const tooltipRef = useRef(null);
  const activeInfoRef = useRef(null);
  const contributionGridRef = useRef<HTMLDivElement>(null);

  // Wheel event handler for horizontal scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (contributionGridRef.current) {
        e.preventDefault();
        contributionGridRef.current.scrollLeft += e.deltaY;
      }
    };

    const gridElement = contributionGridRef.current;
    if (gridElement) {
      gridElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (gridElement) {
        gridElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const getAvailableYears = () => {
    if (!data || !data.total) return [new Date().getFullYear().toString()];
    return Object.keys(data.total).sort((a, b) => parseInt(b) - parseInt(a));
  };

  const getContributionsForYear = () => {
    if (!data || !data.total) return 0;
    return data.total[selectedYear.toString()] || 0;
  };

  const getContributionGrid = () => {
    if (!data || !data.contributions) return { grid: [], months: [] };

    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const yearContributions = data.contributions.filter((c) => {
      const date = new Date(c.date);
      return date >= yearStart && date <= yearEnd;
    });

    const contributionsByDate: { [key: string]: Contribution } = {};
    yearContributions.forEach((c) => {
      contributionsByDate[c.date] = c;
    });

    const months = [];
    const grid = [];

    const startDate = new Date(selectedYear, 0, 1);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(
      startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    for (let j = 0; j < 7; j++) {
      const row = [];
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + j);
      const weekDay = new Date(weekStart);

      for (let i = 0; i < 53; i++) {
        const cellDate = new Date(weekDay);
        const dateString = cellDate.toISOString().split("T")[0];

        const contribution = contributionsByDate[dateString] || {
          date: dateString,
          count: 0,
          level: 0,
        };

        if (j === 0) {
          if (i === 0 || cellDate.getDate() <= 7) {
            months.push({
              name: MONTHS[cellDate.getMonth()],
              index: i,
            });
          }
        }

        row.push({
          date: dateString,
          count: contribution.count,
          level: contribution.level,
        });

        weekDay.setDate(weekDay.getDate() + 7);
      }

      grid.push(row);
    }

    return { grid, months };
  };

  const years = getAvailableYears();
  const totalContributions = getContributionsForYear();
  const { grid, months } = getContributionGrid();

  useEffect(() => {
    if (!loading && gridRef.current) {
      gsap.fromTo(
        ".contribution-cell",
        {
          opacity: 0,
          scale: 0.5,
        },
        {
          opacity: 1,
          scale: 1,
          stagger: {
            amount: 1,
            grid: [7, 53],
            from: "start",
          },
          ease: "back.out(1.2)",
        }
      );

      gsap.fromTo(
        ".month-header",
        {
          opacity: 0,
          y: -10,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          delay: 0.3,
        }
      );

      gsap.fromTo(
        ".day-label",
        {
          opacity: 0,
          x: -10,
        },
        {
          opacity: 1,
          x: 0,
          stagger: 0.1,
          delay: 0.5,
        }
      );
    }
  }, [loading, selectedYear]);

  useEffect(() => {
    if (hoveredCell && tooltipRef.current) {
      gsap.fromTo(
        tooltipRef.current,
        {
          opacity: 0,
          y: 10,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
        }
      );
    }
  }, [hoveredCell]);

  useEffect(() => {
    if (activeCellInfo && activeInfoRef.current) {
      gsap.fromTo(
        activeInfoRef.current,
        {
          opacity: 0,
          height: 0,
          y: 10,
        },
        {
          opacity: 1,
          height: "auto",
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        }
      );
    }
  }, [activeCellInfo]);

  const handleYearChange = (year: number) => {
    gsap.to(".contribution-cell", {
      opacity: 0,
      scale: 0.8,
      stagger: {
        amount: 0.3,
        grid: [7, 53],
        from: "center",
      },
      onComplete: () => {
        setSelectedYear(year);
        setDropdownOpen(false);
      },
    });
  };

  const handlePrevYear = () => {
    const currentIndex = years.indexOf(selectedYear.toString());
    if (currentIndex < years.length - 1) {
      handleYearChange(parseInt(years[currentIndex + 1]));
    }
  };

  const handleNextYear = () => {
    const currentIndex = years.indexOf(selectedYear.toString());
    if (currentIndex > 0) {
      handleYearChange(parseInt(years[currentIndex - 1]));
    }
  };

  const handleCellMouseEnter = (
    cell: Contribution,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredCell(cell);
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 40,
    });

    gsap.to(event.currentTarget, {
      scale: 1.2,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleCellMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredCell(null);

    gsap.to(event.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.in",
    });
  };

  const handleCellClick = (
    cell: Contribution,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setActiveCellInfo(cell);

    gsap
      .timeline()
      .to(event.currentTarget, {
        scale: 0.8,
        duration: 0.1,
      })
      .to(event.currentTarget, {
        scale: 1.1,
        duration: 0.2,
      })
      .to(event.currentTarget, {
        scale: 1,
        duration: 0.1,
      });

    const level = cell.level;
    gsap.to(`.level-${level}`, {
      boxShadow: "0 0 8px 2px rgba(34, 197, 94, 0.5)",
      duration: 0.3,
    });

    setTimeout(() => {
      gsap.to(`.level-${level}`, {
        boxShadow: "none",
        duration: 0.3,
      });
    }, 1000);
  };

  const toggleDropdown = () => {
    if (!dropdownOpen) {
      gsap.fromTo(
        "#year-dropdown",
        {
          opacity: 0,
          y: -10,
          display: "block",
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
        }
      );
    } else {
      gsap.to("#year-dropdown", {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          const dropdown = document.getElementById("year-dropdown");
          if (dropdown) {
            dropdown.style.display = "none";
          }
        },
      });
    }
    setDropdownOpen(!dropdownOpen);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="text-center p-2 text-gray-300">
        Loading contributions...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 p-2">
        Error loading contributions
      </div>
    );

  return (
    <div className="bg-transparent text-grayText  rounded-lg max-w-2xl mx-auto w-full font-cencschit mt-2">
      <h1 className="text-lg text-whiteText font-bold font-centsbook text-left">
        Github Contributions
      </h1>

      <div className="flex justify-between items-center mb-2">
        <div className=" font-semibold flex gap-1 items-center">
          <RadixIcons.CalendarIcon className="mr-2 text-whiteText" />
          <span className="text-green-400 font-bold">{totalContributions}</span>
          <p className="text-whiteText">Contributions in {selectedYear}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              className="bg-transparent !text-whiteText border border-grayText rounded px-3 py-1 text-sm hover:bg-grayText/10 flex items-center gap-1 transition-colors"
              onClick={toggleDropdown}
            >
              {selectedYear} <RadixIcons.ChevronDownIcon className="ml-1" />
            </button>
            <div
              id="year-dropdown"
              className="absolute right-0 mt-1 bg-transparent backdrop-blur-xs border border-grayText rounded shadow-lg z-10"
              style={{ display: "none" }}
            >
              {years.map((year) => (
                <div
                  key={year}
                  className="px-4 py-2 text-whiteText text-sm hover:bg-grayText/10 cursor-pointer transition-colors"
                  onClick={() => handleYearChange(parseInt(year))}
                >
                  {year}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevYear}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-1 rounded-full transition-colors group"
            disabled={
              years.indexOf(selectedYear.toString()) === years.length - 1
            }
          >
            <RadixIcons.ChevronLeftIcon className="group-hover:text-green-400 transition-colors" />
          </button>

          <div className="flex-1 relative h-2">
            <div className="absolute w-full h-full bg-gray-800 rounded-full">
              <div className="w-full h-full flex items-center justify-between px-2">
                {years.map((year) => (
                  <div
                    key={year}
                    className={`h-4 w-4 rounded-full cursor-pointer ${
                      selectedYear.toString() === year
                        ? "bg-green-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    } transition-colors slider-dot`}
                    onClick={() => handleYearChange(parseInt(year))}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleNextYear}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-1 rounded-full transition-colors group"
            disabled={years.indexOf(selectedYear.toString()) === 0}
          >
            <RadixIcons.ChevronRightIcon className="group-hover:text-green-400 transition-colors" />
          </button>
        </div>
      </div>

      <div
        className="overflow-x-auto custom-scrollbar"
        ref={contributionGridRef}
        style={{
          scrollbarWidth: "thin",
          msOverflowStyle: "scrollbar",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="min-w-max" ref={gridRef}>
          {/* Tooltip box */}
          {hoveredCell && (
            <div
              ref={tooltipRef}
              className="absolute bg-transparent backdrop-blur-xs opacity-60   text-gray-200 p-2 rounded text-xs shadow-lg z-10 border border-grayText"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
              }}
            >
              <div className="font-semibold flex items-center gap-1">
                <RadixIcons.CalendarIcon className="mr-1" />
                <span className="text-green-400 font-bold">
                  {hoveredCell.count}
                </span>{" "}
                contributions on {formatDate(hoveredCell.date)}
              </div>
            </div>
          )}

          {/* Month headers */}
          <div className="flex text-xs text-gray-400">
            <div className="w-8"></div>
            <div className="flex-1 flex">
              {months.map((month, i) => (
                <div key={i} className="flex-1 text-center month-header">
                  {month.name}
                </div>
              ))}
            </div>
          </div>

          {/* Days and contribution grid */}
          <div className="flex flex-col gap-1">
            {DAYS.map((day, i) => (
              <div key={i} className="flex items-center h-3">
                <div className="w-8 text-xs text-gray-400 text-right pr-2 day-label">
                  {day}
                </div>
                <div className="flex-1 flex gap-1">
                  {grid[i]?.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`w-3 h-3 rounded-sm contribution-cell level-${
                        cell.level
                      } ${
                        cell.level === 0
                          ? "bg-gray-800"
                          : cell.level === 1
                          ? "bg-green-900"
                          : cell.level === 2
                          ? "bg-green-700"
                          : cell.level === 3
                          ? "bg-green-500"
                          : "bg-green-300"
                      } cursor-pointer transition-all duration-150`}
                      onMouseEnter={(e) => handleCellMouseEnter(cell, e)}
                      onMouseLeave={(e) => handleCellMouseLeave(e)}
                      onClick={(e) => handleCellClick(cell, e)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center mt-2 text-xs text-grayText ">
            <div className="flex items-center group cursor-pointer">
              <RadixIcons.InfoCircledIcon className="mr-1 group-hover:text-whiteText transition-colors" />
              <HighlightedText
                link="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile"
                text="Learn how we count contributions"
                target="_blank"
              />
            </div>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubContributionsGrid;
