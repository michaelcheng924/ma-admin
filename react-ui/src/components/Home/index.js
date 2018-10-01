import "./styles.css";
import React, { Component } from "react";

import { ReadingContainer } from "../Writing";
import PostsManager from "./PostsManager";

class App extends Component {
  state = {
    posts: [],
    root: "apologetics",
    structuredPosts: {},
    token: null
  };

  onSetRoot = root => {
    this.setState({ root });
  };

  renderPostsManager() {
    const { root } = this.state;
    const { posts, structuredPosts } = this.props;

    if (!posts.length) {
      return null;
    }

    return (
      <div>
        <h2>Posts Manager</h2>
        <div className="admin__categories">
          <div onClick={() => this.setState({ root: "apologetics" })}>
            Apologetics
          </div>
          <div onClick={() => this.setState({ root: "theology" })}>
            Theology
          </div>
        </div>
        <PostsManager
          onSetRoot={this.onSetRoot}
          root={root}
          structuredPosts={structuredPosts}
        />
      </div>
    );
  }

  render() {
    return (
      <ReadingContainer style={{ marginBottom: 20 }}>
        <div>{this.renderPostsManager()}</div>
      </ReadingContainer>
    );
  }
}

export default App;
