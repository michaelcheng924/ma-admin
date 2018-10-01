import React, { Component } from "react";
import { find } from "lodash";

export default class PostDetail extends Component {
  render() {
    const { location, posts } = this.props;

    const searchUrl = location.search.split("url=")[1];

    const post = find(posts, postData => {
      return postData.url === searchUrl;
    });

    const {
      title,
      subtitle,
      imageUrl,
      url,
      added,
      updated,
      tags,
      content
    } = posts;

    return (
      <div>
        <span>Test</span>
      </div>
    );
  }
}
