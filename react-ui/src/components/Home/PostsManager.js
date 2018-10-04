import React, { Component } from "react";
import { Link } from "react-router-dom";
import { identity, map } from "lodash";

import { ReadingContainer } from "../Writing";
import ListItem from "../ListItem";

const DATA_MAPPING = {
  apologetics: "/categories/apologetics",
  theology: "/categories/theology"
};

export default class PostsManager extends Component {
  renderCategories() {
    const { root, structuredPosts } = this.props;

    const data = structuredPosts[DATA_MAPPING[root]];

    const categories = map(data.categories, identity).sort((a, b) => {
      const textA = a.category.toUpperCase();
      const textB = b.category.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

    return (
      <div>
        <ReadingContainer>
          <div className="writing">
            <h4>{data.heading}</h4>
          </div>
        </ReadingContainer>
        {categories.map(categoryData => {
          return (
            <div key={categoryData.url}>
              <ReadingContainer>
                <div className="writing">
                  <p>
                    <strong className="first">{categoryData.category}</strong>
                  </p>
                </div>
              </ReadingContainer>
              <ReadingContainer style={{ padding: 0 }}>
                {this.renderPosts(categoryData.posts)}
              </ReadingContainer>
            </div>
          );
        })}
      </div>
    );
  }

  renderPosts(posts) {
    return (
      <div>
        {posts.map(pageData => {
          return (
            <Link key={pageData.url} to={`/postdetail?url=${pageData.url}`}>
              <ListItem key={pageData.url} {...pageData} />
            </Link>
          );
        })}
      </div>
    );
  }

  render() {
    return <div>{this.renderCategories()}</div>;
  }
}
