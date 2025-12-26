interface SearchData {
  search: string;
  detail: boolean;
  target: string;
  page: number;
}

const REST_API_KEY = import.meta.env.VITE_REST_API_KEY;

export const searchBooks = async (searchData: SearchData) => {
  const { search, detail, target, page } = searchData;

  console.log("detail:", detail);
  console.log("target:", target);

  let url = `https://dapi.kakao.com/v3/search/book?query=${search}&page=${page}`;

  if (detail) {
    url += `&target=${target}`;
  }

  console.log("url:", url);

  const data = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `KakaoAK ${REST_API_KEY}`,
    },
  });

  const result = await data.json();
  console.log("result:", result);

  return result;
};
