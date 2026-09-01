export function parsePageParams(searchParams, { maxPageSize = 100, defaultPageSize = 25 } = {}) {
  let page = 1;
  let limit = defaultPageSize;

  if (searchParams) {
    // searchParams can be an object, URLSearchParams, or URL search string
    let params = searchParams;
    if (typeof searchParams === 'string') {
      params = new URLSearchParams(searchParams);
    } else if (searchParams instanceof URLSearchParams) {
      params = searchParams;
    } else if (typeof searchParams === 'object') {
      // Create a dummy URLSearchParams to use .get if it's a plain object that doesn't have it
      params = {
        get: (key) => searchParams[key]
      };
    }

    const pageParam = params.get('page');
    if (pageParam !== null && pageParam !== undefined) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }

    const limitParam = params.get('limit') || params.get('pageSize');
    if (limitParam !== null && limitParam !== undefined) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, maxPageSize);
      }
    }
  }

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
}
