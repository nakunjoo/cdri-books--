export const searchHistoryApi = {
  getHistory: () => {
    const history = localStorage.getItem("searchHistory");
    return history ? JSON.parse(history) : [];
  },
  setHistory: (search: string) => {
    const history = searchHistoryApi.getHistory();
    const historyIndex = history.indexOf(search);
    if (historyIndex > -1) {
      history.splice(historyIndex, 1);
    } else {
      if (history.length === 8) {
        history.splice(-1, 1);
      }
    }
    history.unshift(search);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    return history;
  },

  deleteHistory: (index: number) => {
    const history = searchHistoryApi.getHistory();
    history.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    return history;
  },
};
