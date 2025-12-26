import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch, useHistory } from "../hooks/useHooks";
import BookList from "./BookList";

function SearchContainer() {
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [target, setTarget] = useState<string>("title");
  const [targetValue, setTargetValue] = useState<string>("");
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [detailSearch, setDetailSearch] = useState<string>("");
  const [isTarget, setIsTarget] = useState<boolean>(false);

  const { history, setHistory, deleteHistory } = useHistory();

  const observerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearch({
      search: searchValue,
      detail: isDetail,
      target: targetValue,
    });

  const { bookList, meta } = useMemo(() => {
    if (!data?.pages) {
      return {
        bookList: [],
        meta: {
          total_count: 0,
          pageable_count: 0,
          is_end: true,
        },
      };
    }

    return {
      bookList: data.pages.flatMap((page) => page.documents),
      meta: data.pages[0]?.meta ?? {
        total_count: 0,
        pageable_count: 0,
        is_end: true,
      },
    };
  }, [data]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchValue(search);
    setIsFocus(false);
    setTarget("title");
    setDetailSearch("");
  };

  const onDetailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDetail(true);
    setSearchValue(detailSearch);
    setIsDetailOpen(false);
    setTargetValue(target);
    setSearch("");
  };

  useEffect(() => {
    if (searchValue) {
      setHistory(searchValue);
      refetch();
    }
  }, [searchValue]);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filterHistory: string[] = useMemo(() => {
    if (search.trim() === "") return history;

    const searchLower = search.toLowerCase();
    return history.filter((item: string) => {
      const itemLower = item.toLowerCase();
      return itemLower !== searchLower && itemLower.includes(searchLower);
    });
  }, [search, history]);

  const filterTarget = useMemo(() => {
    const targets = ["title", "person", "publisher"];

    return targets.filter((item: string) => item != target);
  }, [target]);

  const showHistory = isFocus && filterHistory.length > 0;

  const handlerHistory = (search: string) => {
    setSearchValue(search);
    setSearch(search);
  };

  const handlerHistoryDelete = (index: number) => {
    deleteHistory(index);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const targetName = (target: string) => {
    switch (target) {
      case "publisher":
        return "출판사";
      case "person":
        return "저자명";
      default:
        return "제목";
    }
  };

  return (
    <section>
      <div className="flex flex-col items-start justify-start gap-4 mb-6">
        <h2 className="text-title text-[22px]">도서 검색</h2>
        <div className="flex relative justify-start gap-4 items-center">
          <form
            onSubmit={onSubmit}
            className={`${
              showHistory ? "rounded-t-[24px]" : "rounded-[100px]"
            } w-[480px] relative z-10 p-[10px] bg-paletteLG flex justify-start items-center gap-3`}
          >
            <img src="search_icon.png" alt="searchIcon" />
            <input
              ref={searchRef}
              onFocus={() => setIsFocus(true)}
              onBlur={() => {
                setTimeout(() => {
                  setIsFocus(false);
                }, 200);
              }}
              className="bg-transparent w-[90%] focus:outline-none placeholder:text-subTitle"
              type="text"
              placeholder="검색어를 입력하세요"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            {showHistory && (
              <div className="absolute py-7 px-4 z-1 rounded-b-[24px] w-full top-10 left-0 bg-paletteLG flex flex-col gap-6">
                {filterHistory.map((val, index) => {
                  return (
                    <div
                      className="flex justify-between items-center pl-9"
                      key={`${val}-${index}`}
                    >
                      <span
                        onClick={() => handlerHistory(val)}
                        className="text-subTitle cursor-pointer"
                      >
                        {val}
                      </span>
                      <img
                        className="cursor-pointer"
                        src="close.png"
                        alt="close"
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        onClick={() => {
                          handlerHistoryDelete(index);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </form>
          <div className="relative">
            <button
              type="button"
              className="py-[5px] px-[10px] text-subTitle border border-subTitle rounded-[8px] bg-transparent text-sm"
              onClick={() => setIsDetailOpen(true)}
            >
              상세검색
            </button>
            {isDetailOpen && (
              <div
                className="absolute top-[calc(100%+15px)] shadow-[0px_4px_14px_6px_#97979726]
 w-[360px] -left-[143px]  bg-white px-6 py-9 z-20"
              >
                <img
                  className="absolute top-2 right-2 cursor-pointer"
                  src="close-detail.png"
                  alt="close-detail"
                  onClick={() => setIsDetailOpen(false)}
                />
                <form className="flex flex-col gap-4" onSubmit={onDetailSubmit}>
                  <div className="flex justify-center items-center gap-1">
                    <div
                      onClick={() => setIsTarget(!isTarget)}
                      className="relative w-[100px] px-2 py-[6px] border-b border-[#d2d6da] flex justify-between items-center cursor-pointer"
                    >
                      <span className="text-sm font-bold">
                        {targetName(target)}
                      </span>
                      <img src="arrow-detail.png" alt="arrow-detail" />
                      {isTarget && (
                        <div className="absolute top-[calc(100%+6px)] left-0  w-full bg-white shadow-[0px_0px_4px_0px_#00000040]">
                          {filterTarget.map((val, index) => {
                            return (
                              <p
                                onClick={() => setTarget(val)}
                                className="text-sm py-[5px] px-2 text-subTitle"
                                key={`${val}-${index}`}
                              >
                                {targetName(val)}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="py-1 px-[10px] w-[208px] border-b border-palettePrimary">
                      <input
                        className="placeholder:text-subTitle text-sm  focus:outline-none"
                        type="text"
                        placeholder="검색어 입력"
                        value={detailSearch}
                        onChange={(e) => setDetailSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-[8px] bg-palettePrimary text-white text-sm py-[7px] text-center"
                  >
                    검색하기
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <BookList
        tab={"search"}
        bookList={bookList}
        meta={meta}
        searchValue={searchValue}
      />
      <div ref={observerRef} className="h-10" />
    </section>
  );
}

export default SearchContainer;
