import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  startItem,
  endItem,
  totalItems,
}) {
  if (!totalItems || totalPages <= 1) {
    return null;
  }

  
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const pages = getVisiblePages();

  return (
    <div className="pagination-controls flex-col sm:flex-row gap-3">
      <p className="pagination-info text-center sm:text-left">
        Showing {startItem} to {endItem} of {totalItems} records
      </p>

      <div className="pagination-actions flex-wrap justify-center sm:justify-end gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className={`pagination-button ${currentPage === 1 ? "pagination-button-disabled" : ""}`}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {pages[0] > 1 && (
          <span className="text-xs text-[#94A3B8] px-1 font-bold">...</span>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`pagination-button ${page === currentPage ? "pagination-button-current" : ""}`}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <span className="text-xs text-[#94A3B8] px-1 font-bold">...</span>
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className={`pagination-button ${currentPage === totalPages ? "pagination-button-disabled" : ""}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
