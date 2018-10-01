import React, { Component } from "react";
import { identity, map } from "lodash";

import { ReadingContainer } from "../../Writing";

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
        <ReadingContainer style={{ marginBottom: 20 }}>
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
                <div className="writing">
                  {categoryData.posts.map(post => {
                    return (
                      <p key={post.url} className="nomargin indent">
                        {post.title}
                      </p>
                    );
                  })}
                </div>
              </ReadingContainer>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return <div>{this.renderCategories()}</div>;
  }
}
