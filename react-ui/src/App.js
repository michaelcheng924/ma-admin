import React, { Component } from "react";
import Route from "react-router-dom/Route";
import axios from "axios";

import { getStructuredPosts } from "./utils/posts";
import Login from "./components/Login";
import Home from "./components/Home";
import DBManagement from "./components/DBManagement";
import PostDetail from "./components/PostDetail";
import NewPost from "./components/NewPost";

import "./App.css";

class App extends Component {
  state = {
    backup: "",
    passages: [],
    posts: [],
    staging: [],
    structuredPosts: {},
    structuredStaging: {},
    token: null
  };

  componentDidMount() {
    const token = localStorage.getItem("ma-admin-token");

    if (token) {
      axios
        .post("/api/admin/checktoken", { token }, this.getHeaders())
        .then(response => {
          if (response.data.success) {
            this.setState({ token }, () => {
              this.getPosts();
            });
          }
        });
    }
  }

  getHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        "Content-Type": "application/json"
      }
    };
  };

  getPosts = () => {
    return axios.get("/api/admin/getdb", this.getHeaders()).then(response => {
      const { backup, posts, staging } = response.data;

      const structuredPosts = getStructuredPosts(posts);
      const structuredStaging = getStructuredPosts(staging);

      this.setState({
        backup,
        posts,
        staging,
        structuredPosts,
        structuredStaging
      });
    });
  };

  onLoginSuccess = token => {
    localStorage.setItem("ma-admin-token", token);

    this.setState({ token }, () => {
      this.getPosts();
    });
  };

  renderLogin() {
    return (
      <div>
        <Login onLoginSuccess={this.onLoginSuccess} />
      </div>
    );
  }

  renderHome = () => {
    const { staging, structuredStaging } = this.state;

    return (
      <Home
        getHeaders={this.getHeaders}
        posts={staging}
        structuredPosts={structuredStaging}
      />
    );
  };

  renderDBManagement = () => {
    if (!this.state.token) {
      return null;
    }

    const { backup, posts, staging } = this.state;

    return (
      <DBManagement
        backup={backup}
        getHeaders={this.getHeaders}
        posts={posts}
        staging={staging}
      />
    );
  };

  renderPostDetail = ({ location }) => {
    const { staging, structuredStaging } = this.state;

    if (!staging.length) {
      return "Loading...";
    }

    return (
      <PostDetail
        getPosts={this.getPosts}
        getHeaders={this.getHeaders}
        location={location}
        posts={staging}
        structuredPosts={structuredStaging}
      />
    );
  };

  renderNewPost = ({ history }) => {
    return (
      <NewPost
        getPosts={this.getPosts}
        getHeaders={this.getHeaders}
        history={history}
        structuredPosts={this.state.structuredStaging}
      />
    );
  };

  render() {
    return this.state.posts.length ? (
      <div className="App">
        <Route exact path="/" render={this.renderHome} />
        <Route path="/dbmanagement" render={this.renderDBManagement} />
        <Route path="/postdetail" render={this.renderPostDetail} />
        <Route path="/newpost" render={this.renderNewPost} />
      </div>
    ) : (
      this.renderLogin()
    );
  }
}

export default App;
