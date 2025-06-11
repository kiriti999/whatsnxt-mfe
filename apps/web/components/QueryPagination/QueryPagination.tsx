import { useState } from 'react';

const QueryPagination = ({
  totalPage,
  currentPage = '1',
  previousPageClickHandler,
  nextPageClickHandler,
  pageNumberClickHandler,
}) => {
  const [currentPageNumber, setCurrentPageNumber] = useState(() => {
    const page = parseInt(currentPage, 10); // Convert currentPage to a string before passing it to parseInt
    if (page < 1) return 1;

    return page;
  });

  if (totalPage <= 0 || currentPage > totalPage) {
    return null;
  }

  const pageNumbers = Array.from(Array(totalPage + 1).keys()).slice(1);

  const handlePreviousPageClick = () => {
    const newPage = currentPageNumber - 1;

    if (newPage < 1) {
      return;
    }

    setCurrentPageNumber(newPage);
    previousPageClickHandler && previousPageClickHandler(newPage);
  };

  const handleNextPageClick = () => {
    const newPage = currentPageNumber + 1;

    if (newPage > totalPage) {
      return;
    }

    setCurrentPageNumber(newPage);
    nextPageClickHandler && nextPageClickHandler(newPage);
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber === currentPageNumber) {
      return;
    }

    setCurrentPageNumber(pageNumber);

    pageNumberClickHandler && pageNumberClickHandler(pageNumber);
  };

  return (
    <nav aria-label="Page navigation" className="pt-50">
      <ul className="pagination">
        <li className="page-item" onClick={handlePreviousPageClick}>
          <span className="page-link" aria-label="Previous">
            &laquo;
          </span>
        </li>

        {pageNumbers.length &&
          pageNumbers.map((pageNumber) => (
            <li
              className={`page-item ${
                pageNumber === currentPageNumber ? 'active' : ''
              }`}
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
            >
              <span className="page-link">{pageNumber}</span>
            </li>
          ))}

        <li className="page-item" onClick={handleNextPageClick}>
          <span className="page-link" aria-label="Next">
            &raquo;
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default QueryPagination;
