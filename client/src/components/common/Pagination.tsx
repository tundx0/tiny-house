import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Shows the first, last and up to two pages around the current one.
const getPageNumbers = (current: number, total: number) => {
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const buttonClass =
    "px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav className="flex justify-center mt-6" aria-label="Pagination">
      <ul className="flex items-center space-x-2">
        <li>
          <button
            className={buttonClass}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </li>
        {getPageNumbers(currentPage, totalPages).map((number, i) => (
          <li key={`${number}-${i}`}>
            {number === "…" ? (
              <span className="px-2 text-gray-500">…</span>
            ) : (
              <button
                onClick={() => onPageChange(number)}
                aria-current={currentPage === number ? "page" : undefined}
                className={`px-3 py-1 rounded ${
                  currentPage === number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {number}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            className={buttonClass}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
