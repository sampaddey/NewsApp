import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";
import CountryContext from "../context/country/CountryContext";
import { useLoadProgress } from "../context/LoadProgressProvider";

const News = (props) => {
  const initialPage = 1;
  const initialArticles = [];
  const [articles, setArticles] = useState(initialArticles);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalResults, setTotalResults] = useState(0);
  const countryContext = useContext(CountryContext);
  const { country } = countryContext;
  const { setLoadProgress } = useLoadProgress();
  const apiKey = "3f7943da565942ca9a664eb73c6198ee";
  const apiUrl = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=${country}&category=${props.category}&pageSize=${props.pageSize}`;

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const fetchData = async (
    pageNumber = initialPage,
    oldArticles = initialArticles
  ) => {
    setLoadProgress(10);
    setError("");
    await axios
      .get(apiUrl + `&page=${pageNumber}`)
      .then((response) => {
        setPage(pageNumber);
        setLoadProgress(30);
        setArticles(oldArticles.concat(response.data.articles));
        setTotalResults(response.data.totalResults);
        setLoadProgress(70);
      })
      .catch((errorResponse) => {
        setLoadProgress(70);
        setTotalResults(0);
        setError(errorResponse.message);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    setLoading(false);
    setLoadProgress(100);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    fetchData();
    // eslint-disable-next-line
  }, [country]);

  return (
    <>
      <h1 className="text-center" style={{ margin: "90px 0px 35px" }}>
        {`${country.toUpperCase()} - Top ${capitalizeFirstLetter(
          props.category
        )} Headlines`}
      </h1>
      {loading && <Spinner />}
      {error.length !== 0 && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <InfiniteScroll
        dataLength={articles.length}
        next={() => fetchData(page + 1, articles)}
        hasMore={articles.length !== totalResults}
        loader={<Spinner />}
      >
        <div className="container">
          <div className="row">
            {articles.map((article) => {
              return (
                <div className="col-md-4" key={article.url}>
                  <NewsItem article={article} />
                </div>
              );
            })}
          </div>
        </div>
      </InfiniteScroll>
    </>
  );
};

News.defaultProps = {
  pageSize: 30,
  category: "general",
};

News.propTypes = {
  pageSize: PropTypes.number,
  category: PropTypes.string,
};

export default News;