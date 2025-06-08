import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createRoot } from 'react-dom/client';

// Define the Lab type for better clarity
/**
 * @typedef {object} Lab
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} tags
 * @property {string} category
 * @property {string} link
 * @property {number} duration // Added duration in minutes
 * @property {string} difficulty // Added difficulty (e.g., "Beginner", "Intermediate", "Advanced")
 * @property {boolean} featured // Added featured flag
 */

// Define category color mapping for modern accents using provided CSS HEX values
const categoryColors = {
  // Main brand color for the header and general primary elements: --penn-blue #0b2254
  // Main overall background: --antiflash-white #f6f8fc

  "Snowflake": { main: "#265D84", light: "#F6F8FC" }, // Lapis Lazuli for main, Antiflash White for light tag background
  "dbt": { main: "#18406C", light: "#F6F8FC" },     // Indigo Dye for main, Antiflash White for light tag background
  "Power BI": { main: "#E98932", light: "#F6F8FC" }, // Tangerine for main, Antiflash White for light tag background
  "Default": { main: "#969696", light: "#F6F8FC" }  // Battleship Gray for default, Antiflash White for light tag background
};

// Difficulty bar colors - 'empty' remains, 'filled' will now come from categoryColors.main
const difficultyBarColors = {
  empty: "#e0e0e0" // Light grey for empty blocks
};

// Header Component
const Header = ({ siteTitle, logoSrc, navLinks }) => (
  <header className="bg-gradient-to-r from-[#0B2254] to-[#18406C] text-white py-4 shadow-lg rounded-b-xl"> {/* Gradient background */}
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="flex items-center space-x-3">
        {logoSrc && <img src={logoSrc} alt="Snowflake Logo" className="h-9 w-auto filter drop-shadow-md" />}
        {siteTitle && <h1 className="text-3xl font-extrabold tracking-tight text-white">{siteTitle}</h1>}
      </div>
      <nav className="space-x-6 text-sm font-medium">
        {navLinks.map((link, index) => (
          <a key={index} href={link.href} className="hover:underline hover:text-blue-200 transition-colors duration-200 text-base">
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  </header>
);

// SearchBar Component
const SearchBar = ({ value, onChange, onClear, placeholder }) => (
  <div className="relative w-full sm:w-64 flex flex-col items-start"> {/* Adjusted width for alignment */}
    <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search Labs</label>
    <input
      id="search-input"
      type="text"
      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2254] focus:border-transparent transition-all duration-200 shadow-sm"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none top-6"
        aria-label="Clear search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    )}
  </div>
);

// LabCard Component with dynamic colors and duration and featured styling
const LabCard = ({ lab, isFeatured = false }) => { // Added isFeatured prop
  const colors = categoryColors[lab.category] || categoryColors["Default"];
  
  // Determine number of filled blocks for difficulty
  let filledBlocks = 0;
  if (lab.difficulty === "Beginner") {
    filledBlocks = 1;
  } else if (lab.difficulty === "Intermediate") {
    filledBlocks = 2;
  } else if (lab.difficulty === "Advanced") {
    filledBlocks = 3;
  }

  const isComingSoon = !lab.link || lab.link.trim() === "";

  return (
    <div
      className={`bg-white rounded-xl border-t-4 shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden`} // Removed isFeatured specific styling
      style={{ borderTopColor: colors.main }}
    >
      {/* Time bubble */}
      {lab.duration && (
        <div
          className="absolute top-0 right-0 rounded-bl-lg py-1 px-3 text-xs font-semibold flex items-center space-x-1"
          style={{ backgroundColor: colors.main, color: categoryColors.Default.light }}
        >
          {/* Clock Icon - Using inline SVG for simplicity */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{lab.duration} min</span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-xl font-bold leading-snug mb-2" style={{ color: colors.main }}>{lab.title}</h3>
        <p className="text-sm text-gray-600 font-medium italic mb-2">{lab.category}</p>
        
        {/* Difficulty indicator */}
        {lab.difficulty && (
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-sm font-semibold text-gray-700 mr-1">Difficulty:</span>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: index < filledBlocks ? colors.main : difficultyBarColors.empty }} // Changed filled color to category's main color
              ></div>
            ))}
          </div>
        )}

        <p className="text-base text-gray-700 leading-relaxed line-clamp-3">{lab.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {lab.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
            style={{ backgroundColor: colors.light, color: colors.main }}
          >
            {tag}
          </span>
        ))}
      </div>
      <a
        href={isComingSoon ? undefined : lab.link} // Only provide href if not coming soon
        target={isComingSoon ? "_self" : "_blank"} // Change target if coming soon
        rel="noopener noreferrer"
        className={`mt-auto inline-block text-center px-6 py-2 text-white text-base font-semibold rounded-lg shadow-md
          ${isComingSoon ? 'bg-gray-400 cursor-not-allowed' : 'hover:brightness-90 transition-all duration-200 hover:shadow-lg'}`}
        style={{ backgroundColor: isComingSoon ? null : colors.main }} // Apply main color only if not coming soon
      >
        {isComingSoon ? "Coming Soon" : "Launch Lab"}
      </a>
    </div>
  );
};

// Main App Component
export default function App() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All"); // New state for difficulty filter
  /** @type {[Lab[], React.Dispatch<React.SetStateAction<Lab[]>>]} */
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [labsPerPage, setLabsPerPage] = useState(6); // Default to 6 labs per page

  // "Back to Top" state
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Define duration options for the dropdown
  const durationOptions = [
    { label: "All Durations", value: "" },
    { label: "Up to 30 minutes", value: "30" },
    { label: "Up to 60 minutes", value: "60" },
    { label: "Up to 90 minutes", value: "90" },
    { label: "90+ minutes", value: "90+" }
  ];

  // Define difficulty options for the dropdown
  const difficultyOptions = [
    { label: "All Difficulties", value: "All" },
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ];

  // Define labs per page options for the dropdown
  const labsPerPageOptions = [
    { label: "Show 6 Labs", value: 6 },
    { label: "Show 9 Labs", value: 9 },
    { label: "Show 12 Labs", value: 12 },
  ];

  // Debounce function for search
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const handleSearchChange = useCallback(
    debounce((value) => {
      setSearch(value);
      setCurrentPage(1); // Reset to first page on search
    }, 300), // Debounce for 300ms
    []
  );

  useEffect(() => {
    fetch("/labs.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setLabs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load labs.json", err);
        setError("Failed to load labs. Please try again later.");
        setIsLoading(false);
      });
  }, []);

  // Scroll event listener for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) { // Show button after scrolling 300px
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Extract unique categories for the dropdown filter
  const uniqueCategories = useMemo(() => {
    const categories = new Set(["All"]); // Start with 'All' option
    // Explicitly add requested categories to ensure their order/presence if not in all labs
    categories.add("Snowflake");
    categories.add("dbt");
    categories.add("Power BI");

    labs.forEach(lab => {
      if (lab.category) {
        categories.add(lab.category);
      }
    });
    return Array.from(categories).sort();
  }, [labs]);

  // Filtered labs based on search, category, difficulty, and duration
  const filteredAndSearchedLabs = useMemo(() => {
    return labs.filter(
      (lab) => {
        const matchesSearch =
          lab.title.toLowerCase().includes(search.toLowerCase()) ||
          lab.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
          (lab.category && lab.category.toLowerCase().includes(search.toLowerCase()));

        const matchesCategory =
          selectedCategory === "All" || lab.category === selectedCategory;

        const matchesDifficulty =
          selectedDifficulty === "All" || lab.difficulty === selectedDifficulty; // New filter

        let matchesDuration = true;
        if (selectedDuration !== "") {
          const durationValue = parseInt(selectedDuration);
          if (selectedDuration === "90+") {
            matchesDuration = lab.duration && lab.duration >= 90;
          } else {
            matchesDuration = lab.duration && lab.duration <= durationValue;
          }
        }

        return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
      }
    );
  }, [labs, search, selectedCategory, selectedDuration, selectedDifficulty]); // Depend on selectedDifficulty

  // Separate featured labs - now limited to first 3
  const featuredLabs = useMemo(() => {
    return labs.filter(lab => lab.featured).slice(0, 3); // Limit to 3 featured labs
  }, [labs]);


  // Pagination logic
  const indexOfLastLab = currentPage * labsPerPage;
  const indexOfFirstLab = indexOfLastLab - labsPerPage;
  const currentLabs = filteredAndSearchedLabs.slice(indexOfFirstLab, indexOfLastLab);
  const totalPages = Math.ceil(filteredAndSearchedLabs.length / labsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-gray-900 antialiased">
      <Header
        siteTitle=""
        logoSrc="/logo-white.png"
        navLinks={[
          { label: "Home", href: "https://www.datalabsolutions.co.uk" },
          { label: "Contact", href: "https://www.datalabsolutions.co.uk/contact" }
        ]}
      />

      {/* Hero Section: Description of DataLab Labs */}
      <section className="bg-white py-16 px-6 rounded-xl shadow-lg mx-auto max-w-7xl mt-12"> {/* Updated styling for hero section to be white and added mt-12 for space */}
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#0B2254] mb-4">DataLab: Where Data Mastery Begins!</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Dive into practical, hands-on labs designed to help you master various data technologies.
            Whether you're exploring Snowflake, building with dbt, or visualizing data with Power BI,
            our guided labs provide step-by-step instructions to enhance your skills.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Featured Labs Section */}
        {featuredLabs.length > 0 && (
          <div className="mb-16 bg-blue-50 p-8 rounded-xl shadow-lg"> {/* Background remains bg-blue-50 */}
            <h2 className="text-3xl font-bold tracking-tight text-[#0B2254] mb-8 text-center">Featured Labs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredLabs.map((lab) => (
                <LabCard key={`featured-${lab.id}`} lab={lab} />
              ))}
            </div>
            <hr className="my-12 border-gray-200" /> {/* Separator */}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full mb-12"> {/* New box for filters */}
          <h2 className="text-3xl font-bold tracking-tight text-gray-800">Explore Labs</h2> {/* Moved heading inside the box */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full items-start">
            {/* Search filter with visible label */}
            <SearchBar
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search by title, tag, or category..."
            />
            {/* Category filter dropdown with visible label for clarity */}
            <div className="relative flex flex-col items-start">
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2254] focus:border-transparent transition-all duration-200 shadow-sm appearance-none pr-8"
              >
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {/* Duration filter dropdown with visible label for clarity */}
            <div className="relative flex flex-col items-start">
              <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                id="duration-select"
                value={selectedDuration}
                onChange={(e) => { setSelectedDuration(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2254] focus:border-transparent transition-all duration-200 shadow-sm appearance-none pr-8"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {/* Difficulty filter dropdown with visible label */}
            <div className="relative flex flex-col items-start">
              <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2254] focus:border-transparent transition-all duration-200 shadow-sm appearance-none pr-8"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
             {/* Labs per page dropdown with visible label */}
             <div className="relative flex flex-col items-start">
              <label htmlFor="labs-per-page-select" className="block text-sm font-medium text-gray-700 mb-1">Labs per page</label>
              <select
                id="labs-per-page-select"
                value={labsPerPage}
                onChange={(e) => { setLabsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                className="w-full sm:w-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B2254] focus:border-transparent transition-all duration-200 shadow-sm appearance-none pr-8"
              >
                {labsPerPageOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-600 text-lg flex flex-col items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#0B2254]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading quickstarts...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 text-lg border border-red-300 bg-red-50 rounded-lg p-8">
            <p className="font-semibold mb-2">Oops! Something went wrong.</p>
            <p>{error}</p>
            <p className="mt-4 text-sm text-red-500">Please check your network connection or try again later.</p>
          </div>
        ) : filteredAndSearchedLabs.length === 0 ? (
          <div className="text-center py-20 text-gray-600 text-lg border border-gray-300 bg-gray-50 rounded-lg p-8">
            <p className="font-semibold mb-2">No quickstarts found matching your criteria.</p>
            <p>Try adjusting your search terms or clearing the filters.</p>
            {(search || selectedCategory !== "All" || selectedDuration !== "" || selectedDifficulty !== "All" || labsPerPage !== 6) && (
                <button
                    onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedDuration(""); setSelectedDifficulty("All"); setLabsPerPage(6); setCurrentPage(1); }}
                    className="mt-6 px-6 py-2 bg-[#0B2254] text-white rounded-lg hover:bg-[#18406C] transition-colors shadow-md"
                >
                    Clear All Filters
                </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentLabs.map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="max-w-7xl mx-auto px-6 mt-12 py-6 bg-white rounded-xl shadow-lg flex justify-center space-x-2"
              >
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? "bg-[#0B2254] text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-100 mt-20 py-8 text-sm text-center text-gray-500 rounded-t-xl shadow-inner">
        <p>&copy; {new Date().getFullYear()} Snowflake Solutions. All rights reserved.</p>
      </footer>

      {/* Back to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-[#0B2254] text-white p-3 rounded-full shadow-lg hover:bg-[#18406C] transition-colors duration-200 z-50"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
