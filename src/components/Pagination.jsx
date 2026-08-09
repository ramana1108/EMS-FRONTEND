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

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination-controls">
      <p className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} records
      </p>

      <div className="pagination-actions">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className={`pagination-button ${currentPage === 1 ? "pagination-button-disabled" : ""}`}
          disabled={currentPage === 1}
        >
          Prev
        </button>

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
