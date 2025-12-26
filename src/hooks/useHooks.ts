import { searchBooks } from "../api/search";
import { searchHistoryApi } from "../api/history";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

interface SearchData {
  search: string;
  detail: boolean;
  target: string;
}

export const useSearch = (searchData: SearchData) => {
  return useInfiniteQuery({
    queryKey: [
      "books",
      searchData.search,
      searchData.target,
      searchData.detail,
    ],
    queryFn: ({ pageParam = 1 }) =>
      searchBooks({ ...searchData, page: pageParam as number }),
    getNextPageParam: (lastPage, allPages) => {
      const isEnd = lastPage.meta.is_end;
      if (isEnd) return undefined;

      return allPages.length + 1;
    },
    retry: false,
    enabled: false,
    initialPageParam: 1,
  });
};

export const useHistory = () => {
  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ["searchHistory"],
    queryFn: searchHistoryApi.getHistory,
  });

  const setSearchHistory = useMutation({
    mutationFn: searchHistoryApi.setHistory,
    onSuccess: (history: string[]) => {
      queryClient.setQueryData(["searchHistory"], history);
    },
  });

  const deleteHistory = useMutation({
    mutationFn: searchHistoryApi.deleteHistory,
    onSuccess: (history: string[]) => {
      queryClient.setQueryData(["searchHistory"], history);
    },
  });

  return {
    history,
    setHistory: setSearchHistory.mutate,
    deleteHistory: deleteHistory.mutate,
  };
};
