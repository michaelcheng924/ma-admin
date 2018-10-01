import React, { Component } from "react";
import Route from "react-router-dom/Route";
import axios from "axios";

import { getStructuredPosts } from "./utils/posts";
import Login from "./components/Login";
import Home from "./components/Home";
import PostDetail from "./components/PostDetail";

import "./App.css";

class App extends Component {
  state = {
    posts: [],
    structuredPosts: {},
    token: null
  };

  componentDidMount() {
    const token = localStorage.getItem("ma-admin-token");

    if (token) {
      axios
        .post("/api/admin/checktoken", { token }, this.getHeaders())
        .then(response => {
          if (response.data.success) {
            this.afterLogin(token);
          }
        });
    }
  }

  getHeaders() {
    const token = localStorage.getItem("ma-admin-token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  afterLogin(token) {
    this.setState({ token });

    axios.get("/api/posts").then(response => {
      const posts = response.data.posts;
      const structuredPosts = getStructuredPosts(posts);

      this.setState({ posts, structuredPosts });
    });
  }

  onLoginSuccess = token => {
    localStorage.setItem("ma-admin-token", token);

    this.afterLogin(token);
  };

  renderLogin() {
    return (
      <div>
        <Login onLoginSuccess={this.onLoginSuccess} />
      </div>
    );
  }

  renderHome = () => {
    const { posts, structuredPosts } = this.state;

    return <Home posts={posts} structuredPosts={structuredPosts} />;
  };

  renderPostDetail = ({ location }) => {
    const { posts, structuredPosts } = this.state;

    return (
      <PostDetail
        location={location}
        posts={posts}
        structuredPosts={structuredPosts}
      />
    );
  };

  render() {
    return this.state.token ? (
      <div className="App">
        <Route exact path="/" render={this.renderHome} />
        <Route path="/postdetail" render={this.renderPostDetail} />
      </div>
    ) : (
      this.renderLogin()
    );
  }
}

export default App;
